'use strict';


const fs = require('fs');
const path = require('path');
const Tea = require('@darabonba/parser');
const Annotation = require('@darabonba/annotation-parser');
const {
  PKG_FILE,
} = require('./constants');
const REQUIRED_RELEASE_LANGUAGE = ['java', 'ts', 'go', 'php', 'csharp', 'python'];
const REQUIRED_API_ITEM = ['description', 'return'];
const OPTIONAL_API_ITEM = ['codeSample', 'errors', 'examples'];
const REQUIRED_API_PARAM_ITEM = ['description'];
const REQUIRED_MODEL_ITEM = ['description'];
const REQUIRED_MODEL_FIELD_ITEM = ['description'];
const OPTIONAL_MODEL_FIELD_ITEM = ['default', 'example'];


function _hasValue(value) {
  if (value && value.length) {
    return true;
  }
  return false;
}

function _get(obj, path, defaultValue) {
  if (!obj || !path || !path.length) {
    return defaultValue;
  }
  let paths = path.split('.');
  paths.forEach(pathItem => {
    if (obj[pathItem]) {
      obj = obj[pathItem];
    } else {
      obj = defaultValue;
    }
  });
  return obj;
}

class AstFormatter {
  constructor(pkgDir) {
    const pkgFilePath = path.join(pkgDir, PKG_FILE);
    const pkgContent = fs.readFileSync(pkgFilePath, 'utf8');
    this.pkg = JSON.parse(pkgContent);
    const readmeFilePath = path.join(pkgDir, 'README.md');
    if (fs.existsSync(readmeFilePath)) {
      this.readme = fs.readFileSync(readmeFilePath, 'utf8');
    }
    this._readTeaCheckerData(path.join(pkgDir, this.pkg.main));
  }

  getPkg() {
    return this.pkg;
  }

  getReadme() {
    return this.readme || 'No README.md file';
  }

  _readTeaCheckerData(specPath) {
    if (!specPath || !specPath.length) {
      return {};
    }
    const spec = fs.readFileSync(specPath, 'utf8');
    this.checkData = Tea.getChecker(spec, specPath);
  }

  getAstData() {
    if (this.astData) {
      return this.astData;
    }
    const moduleBodyNodes = _get(this.checkData, 'ast.moduleBody.nodes', []);
    const { apiObj, functionObj, initData, isInterface } = this._parseModuleBody(moduleBodyNodes);
    // modelData must includes  origin model like 'testModel' and sub_model like 'testModelData' from 'testModel.data'
    let modelData = this.checkData.ast.models;
    moduleBodyNodes.forEach(item => {
      if (item.type === 'model') {
        modelData[item.modelName.lexeme] = item;
      }
    });
    const modelResult = this._parseModel(modelData);
    const moduleAnno = this._formatAnnotation(_get(this.checkData, 'ast.annotation.value', ''));
    this.astData = {
      api: apiObj,
      function: functionObj,
      init: initData,
      model: modelResult,
      isInterface,
      description: moduleAnno.description || ''
    };
    return this.astData;
  }

  getImportModule() {
    const importModule = {};
    this.checkData.dependencies.forEach((value, key) => {
      importModule[key] = {
        modelObj: this._parseModel(value.ast.models)
      };
    });
    return importModule;
  }

  _parseModuleBody(moduleBodyNodes = []) {
    const apiObj = {};
    const functionObj = {};
    let initData;
    let isInterface = false;
    moduleBodyNodes.forEach((node) => {
      switch (node.type) {
        case 'api':
          apiObj[node.apiName.lexeme] = this._parseModuleNode(node, 'api');
          break;
        case 'function':
          functionObj[node.functionName.lexeme] = this._parseModuleNode(node, 'function');
          isInterface = functionObj[node.functionName.lexeme].isInterface ? true : isInterface;
          break;
        case 'init':
          initData = this._parseModuleNode(node, 'init');
          isInterface = initData.isInterface ? true : isInterface;
          break;
        default:
      }
    });
    return {
      isInterface,
      apiObj,
      functionObj,
      initData
    };
  }

  _parseModuleNode(data, type) {
    let result = {
      isInterface: false
    };
    let paramAnnotation = {};
    switch (type) {
      case 'api':
        result.apiName = data.apiName.lexeme;
        break;
      case 'function':
        result.functionName = data.functionName.lexeme;
        result.isStatic = data.isStatic;
        result.isAsync = data.isAsync;
        result.isInterface = !data.functionBody;
        break;
      case 'init':
        result.isInterface = !data.initBody;
        break;
    }
    if (data.annotation && data.annotation.value) {
      result.annotation = this._formatAnnotation(data.annotation.value);
      result.annotation.params && result.annotation.params.forEach(item => {
        paramAnnotation[item.name] = item.text;
      });
    }
    result.params = data.params.params.map(item => {
      return this._formatNodeParamType(item, paramAnnotation);
    });
    result.returnType = this._formatNodeReturnType(data.returnType);
    return result;
  }

  _formatNodeParamType(param, paramAnnotation) {
    let item = {
      paramName: param.paramName.lexeme,
      paramType: param.paramType.lexeme || param.paramType.type,
      defaultValue:
        param.defaultValue && (param.defaultValue.lexeme || param.defaultValue.string)
    };
    if (item.paramType === 'map') {
      item.keyType = param.paramType.keyType.lexeme;
      item.valueType = param.paramType.valueType.lexeme;
    }
    if (item.paramType === 'array') {
      item.paramItemType = param.paramType.subType && param.paramType.subType.lexeme;
    }
    if (item.paramType === 'moduleModel' && param.paramType.path) {
      item.paramType = `${param.paramType.path[0].lexeme}.${param.paramType.path[1].lexeme}`;
    }
    if (paramAnnotation && paramAnnotation[item.paramName]) {
      item.description = paramAnnotation[item.paramName];
    }
    return item;
  }

  _formatNodeReturnType(param) {
    if (!param) {
      return {};
    }
    let result = {
      paramType: param.type || param.lexeme
    };
    if (result.paramType === 'map') {
      result.keyType = param.keyType.lexeme;
      result.valueType = param.valueType.lexeme;
    } else if (result.paramType === 'array') {
      result.paramItemType = param.subType.lexeme;
    } else if (result.paramType === 'moduleModel' && param.path) {
      result.paramType = `${param.path[0].lexeme}.${param.path[1].lexeme}`;
    }
    return result;
  }

  getScoreReport() {
    let _scoreReport = this.scoreReport || {};
    _scoreReport.release = [];
    let release = (this.pkg && this.pkg.releases) || {};
    let releaseArr = Object.keys(release);
    REQUIRED_RELEASE_LANGUAGE.forEach(language => {
      if (!releaseArr.includes(language)) {
        _scoreReport.release.push(language);
      }
    });
    return _scoreReport;
  }

  getScore() {
    if (!this.astData) {
      this.getAstData();
    }
    this.scoreReport = {
      api: {},
      function: {},
      model: {}
    };
    this.requiredScore = {
      total: 0,
      filled: 0
    };
    this.optionalScore = {
      total: 0,
      filled: 0
    };
    this._countApiScore(Object.values(_get(this.astData, 'api', {})), 'api');
    this._countApiScore(Object.values(_get(this.astData, 'function', {})), 'function');
    this._countModelScore(Object.values(_get(this.astData, 'model', {})));
    let countResult = {
      readme: 0,
      release: 0,
      annotation: 0,
      total: 0
    };
    countResult.annotation = Math.ceil((this.requiredScore.filled / this.requiredScore.total) * 70
      + (this.optionalScore.filled / this.optionalScore.total) * 30);
    if (this.readme && this.readme.length) {
      countResult.readme = 100;
    }
    if (this.pkg && this.pkg.releases) {
      let releaseCount = Object.keys(this.pkg.releases).length;
      countResult.release = Math.ceil(releaseCount * 100 / REQUIRED_RELEASE_LANGUAGE.length);
    }
    countResult.total = Math.ceil(countResult.annotation * 0.7 + countResult.readme * 0.2 + countResult.release * 0.1);
    return countResult;
  }

  _countApiScore(nodes, type) {
    nodes.forEach(item => {
      let name = item.apiName || item.functionName;
      this.scoreReport[type][name] = [];
      let annotation = item.annotation || {};
      REQUIRED_API_ITEM.forEach(key => {
        this.requiredScore.total++;
        if (_hasValue(annotation[key])) {
          this.requiredScore.filled++;
        } else {
          this.scoreReport[type][name].push(key);
        }
      });
      OPTIONAL_API_ITEM.forEach(key => {
        this.optionalScore.total++;
        if (_hasValue(annotation[key])) {
          this.optionalScore.filled++;
        }
      });
      let paramIncomplete = false;
      item.params.forEach(item => {
        REQUIRED_API_PARAM_ITEM.forEach(key => {
          this.requiredScore.total++;
          if (_hasValue(item[key])) {
            this.requiredScore.filled++;
          } else {
            paramIncomplete = true;
          }
        });
      });
      if (paramIncomplete) {
        this.scoreReport[type][name].push('param_description');
      }
    });
  }
  
  _countModelScore(nodes) {
    nodes.forEach(item => {
      let name = item.modelName;
      this.scoreReport.model[name] = [];
      let annotation = item.annotation || {};
      REQUIRED_MODEL_ITEM.forEach(key => {
        this.requiredScore.total++;
        if (_hasValue(annotation[key])) {
          this.requiredScore.filled++;
        } else {
          this.scoreReport.model[name].push(key);
        }
      });
      let fieldIncomplete = false;
      item.fields.forEach(item => {
        REQUIRED_MODEL_FIELD_ITEM.forEach(key => {
          this.requiredScore.total++;
          if (_hasValue(item[key])) {
            this.requiredScore.filled++;
          } else {
            fieldIncomplete = true;
          }
        });
        OPTIONAL_MODEL_FIELD_ITEM.forEach(key => {
          this.optionalScore.total++;
          if (_hasValue(item[key])) {
            this.optionalScore.filled++;
          }
        });
      });
      if (fieldIncomplete) {
        this.scoreReport.model[name].push('field_description');
      }
    });
  }

  _parseModel(models) {
    const modelObj = {};
    for (let [modelKey, moduleItem] of Object.entries(models)) {
      modelObj[modelKey] = this._formatModelNode(moduleItem);
    }
    return modelObj;
  }

  _formatModelNode(model) {
    if (!model) {
      return undefined;
    }
    let modelItem = {
      modelName: model.modelName.lexeme,
      fields: []
    };
    let nodes = model.modelBody.nodes;
    for (let i = 0; i < nodes.length; i++) {
      let item = {
        fieldName: nodes[i].fieldName.lexeme,
        fieldType: nodes[i].fieldValue.fieldType || nodes[i].fieldValue.type,
        required: nodes[i].required
      };
      if (item.fieldType === 'array') {
        item.fieldItemType = nodes[i].fieldValue.fieldItemType.lexeme || nodes[i].fieldValue.fieldItemType.type;
        if (item.fieldItemType === 'modelBody') {
          item.fieldItemType = modelItem.modelName + '.' + item.fieldName;
        }
      }
      if (item.fieldType === 'map') {
        item.keyType = nodes[i].fieldValue.keyType.lexeme;
        item.valueType = nodes[i].fieldValue.valueType.lexeme;
      }
      if (item.fieldType === 'modelBody') {
        item.fieldType = modelItem.modelName + '.' + item.fieldName;
      }
      if (typeof item.fieldType !== 'string') {
        if (item.fieldType.lexeme) {
          item.fieldType = item.fieldType.lexeme;
        } else if (item.fieldType.type === 'moduleModel' && item.fieldType.path) {
          item.fieldType = `${item.fieldType.path[0].lexeme}.${item.fieldType.path[1].lexeme}`;
        }
      }
      for (let j = 0; j < nodes[i].attrs.length; j++) {
        let attr = nodes[i].attrs[j].attrName.lexeme;
        let value = nodes[i].attrs[j].attrValue.string;
        item[attr] = value;
      }
      modelItem.fields.push(item);
    }
    if (model.annotation) {
      modelItem.annotation = this._formatAnnotation(model.annotation.value);
    }
    if (model.modelName.lexeme.includes('.')) {
      let modelArr = model.modelName.lexeme.split('.');
      let subModel = modelArr.pop();
      let parentModel = modelArr.join('.');
      let description = `the ${subModel} of {{${parentModel}}}`;
      modelItem.annotation = Object.assign(modelItem.annotation || {}, {
        description
      });
    }
    return modelItem;
  }

  _formatAnnotation(value) {
    if (!value || !value.length) {
      return {};
    }
    var ast = Annotation.parse(value);
    var description = ast.items.find((item) => {
      return item.type === 'description';
    });
    var codeSample = ast.items.find((item) => {
      return item.type === 'codeSample';
    });
    var _return = ast.items.find((item) => {
      return item.type === 'return';
    });
    var examples = ast.items.filter((item) => {
      return item.type === 'example';
    });
    var errors = ast.items.filter((item) => {
      return item.type === 'error';
    }).map((item) => {
      item.text = item.text.text;
      item.code = item.code.id;
      return item;
    });
    var descriptionText = description ? description.text.text : '';
    var returnText = _return ? _return.text.text : '';
    var codeSampleText = codeSample ? codeSample.text.text : '';
    return {
      description: descriptionText,
      codeSample: codeSampleText,
      params: ast.items.filter((item) => {
        return item.type === 'param';
      }).map((item) => {
        return {
          name: item.name.id,
          text: item.text.text
        };
      }),
      examples: examples.map((item) => {
        return item.text.text;
      }),
      errors: errors,
      return: returnText
    };
  }
}

module.exports = AstFormatter;
