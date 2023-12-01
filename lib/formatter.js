'use strict';

const assert = require('assert');

const {
  Tag,
  comment,
  util
} = require('@darabonba/parser');

function _name(str) {
  return str.lexeme;
}

function _required(required) {
  return !required ? '?' : '';
}

function _string(str) {
  return str.string.replace(/'/g, "\\'");
}

class Formatter {
  constructor() {
    this.output = '';
  }

  emit(str, level) {
    this.output += ' '.repeat(level * 2) + str;
  }

  visit(ast, level = 0) {
    this.comments = ast.comments;
    if (ast.annotation) {
      this.emit(`${ast.annotation.value}\n`, level);
      this.emit(`\n`, level);
    }

    if (ast.imports && ast.imports.length > 0) {
      ast.imports.forEach(item => {
        this.emit(`import ${item.lexeme};\n`, level);
      });
      this.emit(`\n`);
    }

    if (ast.extends) {
      this.emit(`extends ${ast.extends.lexeme};\n`, level);
      this.emit(`\n`);
    }

    for (let i = 0; i < ast.moduleBody.nodes.length; i++) {
      const node = ast.moduleBody.nodes[i];
      if (i !== 0 && node.type !== 'type') {
        this.emit('\n');
      }
      if (node.annotation) {
        this.emit(`${node.annotation.value}\n`, level);
      }
      const comments = comment.getFrontComments(this.comments, node.tokenRange[0]);
      this.visitComments(comments, level);
      if (node.type === 'model') {
        this.visitModel(node, level);
      } else if (node.type === 'api') {
        this.visitAPI(node, level);
      } else if (node.type === 'function') {
        this.visitFunction(node, level);
      } else if (node.type === 'const') {
        this.visitConst(node, level);
      } else if (node.type === 'type') {
        this.visitTypeDeclaration(node, level);
      } else if (node.type === 'init') {
        this.visitInit(node, level);
      }
    }
    this.emit(`\n`);
  }

  visitTypeDeclaration(ast, level) {
    assert.equal(ast.type, 'type');
    this.emit(`type ${_name(ast.vid)} = `, level);
    this.visitType(ast.value);
    this.emit(`\n`);
  }

  visitInit(ast, level) {
    assert.equal(ast.type, 'init');
    this.emit(`init`, level);
    this.visitParams(ast.params, level);
    if (ast.initBody) {
      this.emit(` {\n`);
      this.visitStmts(ast.initBody, level + 1);
      this.emit(`}\n`, level);
    } else {
      this.emit(`;\n`);
    }
  }

  visitFunction(ast, level) {
    assert.equal(ast.type, 'function');

    this.emit(``, level);
    if (ast.isStatic) {
      this.emit(`static `);
    }
    if (ast.isAsync) {
      this.emit(`async `);
    }
    this.emit(`function ${_name(ast.functionName)}`);
    this.visitParams(ast.params);
    if (ast.hasThrow) {
      this.emit(`throws `);
    }
    this.emit(`: `);
    this.visitType(ast.returnType);
    if (ast.functionBody) {
      this.emit(` {\n`);
      this.visitStmts(ast.functionBody.stmts, level + 1);
      this.emit(`}\n`, level);
    } else {
      this.emit(`;\n`);
    }
  }

  visitType(ast, level) {
    if (ast.tag === Tag.Tag.TYPE) {
      this.emit(`${_name(ast)}`);
    } else if (ast.tag === Tag.Tag.ID) {
      this.emit(`${_name(ast)}`);
    } else if (ast.type === 'map') {
      this.emit(`map[${_name(ast.keyType)}]`);
      this.visitType(ast.valueType);
    } else if (ast.type === 'array') {
      this.emit(`[ `);
      this.visitType(ast.subType);
      this.emit(` ]`);
    } else if (ast.type === 'moduleModel') {
      for (let i = 0; i < ast.path.length; i++) {
        const item = ast.path[i];
        if (i > 0) {
          this.emit('.');
        }
        this.emit(`${_name(item)}`);
      }
      this.emit(``);
    } else {
      console.log(ast);
      throw new Error(`unimplemented`);
    }
  }

  visitAPI(ast, level) {
    assert.equal(ast.type, 'api');

    const apiName = _name(ast.apiName);
    this.emit(`api ${apiName}`, level);
    this.visitParams(ast.params, level);
    this.emit(`: `);
    this.visitType(ast.returnType);
    this.emit(` {\n`);
    this.visitAPIBody(ast.apiBody, level + 1);
    this.emit(`}`, level);
    if (ast.returns) {
      this.emit(' returns {\n');
      this.visitReturnBody(ast.returns, level + 1);
      this.emit(`}`, level);
    }

    if (ast.runtimeBody) {
      this.emit(' runtime ');
      this.visitObject(ast.runtimeBody, level);
    }

    this.emit('\n');
  }

  visitParams(ast, level) {
    assert.equal(ast.type, 'params');
    this.emit('(');
    for (var i = 0; i < ast.params.length; i++) {
      if (i !== 0) {
        this.emit(', ');
      }
      const node = ast.params[i];
      // emit(node);
      assert.equal(node.type, 'param');
      //   { type: 'param',
      // paramName: Word { tag: 2, lexeme: 'product' },
      // paramType: Word { tag: 8, lexeme: 'string' },
      // defaultValue: null }
      this.emit(`${_name(node.paramName)}: `);
      this.visitType(node.paramType);
    }
    this.emit(')');
  }

  visitAPIBody(ast, level) {
    assert.equal(ast.type, 'apiBody');
    this.visitStmts(ast.stmts, level);
  }

  visitComments(comments, level) {
    if (comments.length > 0) {
      for (let i = 0; i < comments.length; i++) {
        const item = comments[i];
        this.emit(`${item.value}\n`, level);
      }
    }
  }

  visitFor(ast, level) {
    assert.equal(ast.type, 'for');
    this.emit(`for (var ${_name(ast.id)} : `, level);
    this.visitExpr(ast.list, level);
    this.emit(`) {\n`);
    this.visitStmts(ast.stmts, level + 1);
    this.emit(`}\n`, level);
  }

  visitMapAccess(ast, level) {
    assert.equal(ast.type, 'map_access');
    this.emit(`${_name(ast.id)}[`);
    this.visitExpr(ast.accessKey, level);
    this.emit(']');
  }

  visitStmt(ast, level) {
    const comments = comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.visitComments(comments, level);
    if (ast.type === 'return') {
      this.visitReturn(ast, level);
    } else if (ast.type === 'if') {
      this.visitIf(ast, level);
    } else if (ast.type === 'throw') {
      this.visitThrow(ast, level);
    } else if (ast.type === 'assign') {
      this.visitAssign(ast, level);
    } else if (ast.type === 'for') {
      this.visitFor(ast, level);
    } else if (ast.type === 'retry') {
      this.visitRetry(ast, level);
    } else if (ast.type === 'declare') {
      this.visitDeclare(ast, level);
    } else {
      this.emit(``, level);
      this.visitExpr(ast, level);
      this.emit(`;\n`);
    }
  }

  visitFieldValue(ast, level) {
    if (ast.type === 'fieldType') {
      if (ast.fieldType === 'map') {
        this.emit(`map[`);
        this.visitType(ast.keyType, level);
        this.emit(`]`);
        this.visitType(ast.valueType, level);
        return;
      }

      if (ast.fieldType === 'array') {
        if (ast.fieldItemType.type === 'modelBody') {
          this.emit('[\n');
          this.emit('{\n', level + 1);
          this.visitModelBody(ast.fieldItemType, level + 2);
          this.emit('}\n', level + 1);
          this.emit(`]`, level);
        } else {
          this.emit(`[ ${_name(ast.fieldItemType)} ]`);
        }
        return;
      }

      if (util.isBasicType(ast.fieldType)) {
        this.emit(ast.fieldType);
        return;
      }

      if (ast.fieldType.type === 'moduleModel') {
        for (let i = 0; i < ast.fieldType.path.length; i++) {
          const item = ast.fieldType.path[i];
          if (i > 0) {
            this.emit(`.`);
          }
          this.emit(`${_name(item)}`);
        }
        return;
      }

      if (ast.fieldType.tag === Tag.Tag.ID) {
        this.emit(`${_name(ast.fieldType)}`);
        return;
      }
    }

    if (ast.type === 'modelBody') {
      this.emit('{\n');
      this.visitModelBody(ast, level + 1);
      this.emit('}', level);
      return;
    }
    console.log(ast);
    throw new Error('unimpelemented');
  }

  visitFieldAttrs(attrs) {
    if (attrs.length === 0) {
      return;
    }
    this.emit(`(`);
    for (var i = 0; i < attrs.length; i++) {
      assert.equal(attrs[i].type, 'attr');
      if (i > 0) {
        this.emit(`, `);
      }
      const node = attrs[i];
      this.emit(`${_name(node.attrName)}=`);
      if (node.attrValue.tag === Tag.Tag.STRING) {
        this.emit(`'${_string(node.attrValue)}'`);
      } else if (node.attrValue.tag === Tag.Tag.NUMBER) {
        this.emit(node.attrValue.value);
      } else if (node.attrValue.tag === Tag.Tag.BOOL) {
        this.emit(node.attrValue.lexeme);
      } else {
        console.log(node);
        throw new Error(`un-implemented`);
      }
    }
    this.emit(`)`);
  }

  visitModelField(ast, level) {
    assert.equal(ast.type, 'modelField');
    const fieldName = _name(ast.fieldName);
    const required = _required(ast.required);
    this.emit(`${fieldName}${required}: `, level);
    this.visitFieldValue(ast.fieldValue, level);
    this.visitFieldAttrs(ast.attrs, level);
  }

  visitModelBody(ast, level) {
    assert.equal(ast.type, 'modelBody');
    for (let i = 0; i < ast.nodes.length; i++) {
      const node = ast.nodes[i];
      this.visitModelField(node, level);
      if (i < ast.nodes.length - 1) {
        this.emit(',\n');
      } else {
        this.emit('\n');
      }
    }
  }

  visitModel(ast, level) {
    assert.equal(ast.type, 'model');
    this.emit(`model ${_name(ast.modelName)} {\n`, level);
    this.visitModelBody(ast.modelBody, level + 1);
    this.emit(`}\n`, level);
  }

  visitObjectFieldValue(ast, level) {
    this.visitExpr(ast, level);
  }

  visitObjectField(ast, level) {
    if (ast.type === 'objectField') {
      this.emit(`${_name(ast.fieldName)} = `, level);
      this.visitObjectFieldValue(ast.expr, level);
    } else if (ast.type === 'expandField') {
      // TODO: more cases
      this.emit(`...`, level);
      this.visitExpr(ast.expr, level);
    } else {
      throw new Error('unimpelemented');
    }
  }

  visitObject(ast, level) {
    assert.equal(ast.type, 'object');

    if (ast.fields.length === 0) {
      this.emit('{ }');
    } else {
      this.emit('{\n');
      for (var i = 0; i < ast.fields.length; i++) {
        const comments = comment.getFrontComments(this.comments, ast.fields[i].tokenRange[0]);
        this.visitComments(comments, level + 1);
        this.visitObjectField(ast.fields[i], level + 1);
        if (i < ast.fields.length - 1) {
          this.emit(`,\n`);
        } else {
          this.emit(`\n`);
        }
      }
      this.emit('}', level);
    }
  }

  visitVirtualCall(ast, level) {
    assert.equal(ast.type, 'virtualCall');
    this.emit(`${_name(ast.vid)}(`);
    for (var i = 0; i < ast.args.length; i++) {
      ast.args[i];
      this.visitExpr(ast.args[i], level);
      if (i !== ast.args.length - 1) {
        this.emit(', ');
      }
    }
    this.emit(`)`);
  }

  visitPropertyAccess(ast, level) {
    assert.equal(ast.type, 'property_access');
    this.emit(`${_name(ast.id)}`);

    for (var i = 0; i < ast.propertyPath.length; i++) {
      this.emit(`.${_name(ast.propertyPath[i])}`);
    }
  }

  visitExpr(ast, level) {
    if (ast.type === 'virtualCall') {
      this.visitVirtualCall(ast, level);
    } else if (ast.type === 'property_access') {
      this.visitPropertyAccess(ast, level);
    } else if (ast.type === 'map_access') {
      this.visitMapAccess(ast, level);
    } else if (ast.type === 'string') {
      this.emit(`'${_string(ast.value)}'`);
    } else if (ast.type === 'object') {
      this.visitObject(ast, level);
    } else if (ast.type === 'variable') {
      this.emit(_name(ast.id));
    } else if (ast.type === 'virtualVariable') {
      this.emit(_name(ast.vid));
    } else if (ast.type === 'template_string') {
      this.emit('`');
      for (var i = 0; i < ast.elements.length; i++) {
        var item = ast.elements[i];
        if (item.type === 'element') {
          this.emit(_string(item.value));
        } else if (item.type === 'expr') {
          this.emit('${');
          this.visitExpr(item.expr, level);
          this.emit('}');
        }
      }
      this.emit('`');
    } else if (ast.type === 'call') {
      if (ast.left.type === 'method_call') {
        this.emit(`${_name(ast.left.id)}`);
      } else if (ast.left.type === 'static_call') {
        this.emit(`${_name(ast.left.id)}`);
        for (let i = 0; i < ast.left.propertyPath.length; i++) {
          const item = ast.left.propertyPath[i];
          this.emit(`.${_name(item)}`);
        }
      } else if (ast.left.type === 'instance_call') {
        this.emit(`${_name(ast.left.id)}`);
        for (let i = 0; i < ast.left.propertyPath.length; i++) {
          const item = ast.left.propertyPath[i];
          this.emit(`.${_name(item)}`);
        }
      } else {
        console.log(ast);
        throw new Error('un-implemented');
      }
      this.visitArgs(ast.args, level);
    } else if (ast.type === 'not') {
      this.emit(`!`);
      this.visitExpr(ast.expr, level);
    } else if (ast.type === 'number') {
      this.emit(`${ast.value.value}`);
    } else if (ast.type === 'boolean') {
      this.emit(`${ast.value}`);
    } else if (ast.type === 'null') {
      this.emit(`null`);
    } else if (ast.type === 'or') {
      this.visitExpr(ast.left, level);
      this.emit(` || `);
      this.visitExpr(ast.right, level);
    } else if (ast.type === 'and') {
      this.visitExpr(ast.left, level);
      this.emit(` && `);
      this.visitExpr(ast.right, level);
    } else if (ast.type === 'construct_model') {
      this.emit(`new ${_name(ast.aliasId)}`);
      for (let i = 0; i < ast.propertyPath.length; i++) {
        const item = ast.propertyPath[i];
        this.emit(`.${_name(item)}`);
      }
      if (ast.object) {
        this.visitObject(ast.object, level);
      }
    } else if (ast.type === 'construct') {
      this.emit(`new ${_name(ast.aliasId)}`);
      this.visitArgs(ast.args);
    } else if (ast.type === 'array') {
      if (ast.items.length === 0) {
        this.emit(`[ ]`);
      } else {
        this.emit(`[\n`);
        for (let i = 0; i < ast.items.length; i++) {
          const item = ast.items[i];
          this.visitExpr(item, level + 1);
          this.emit(`,\n`);
        }
        this.emit(`]`);
      }
    } else {
      console.log(ast);
      throw new Error('unimpelemented');
    }
  }

  visitArgs(args, level) {
    this.emit('(');
    for (let i = 0; i < args.length; i++) {
      const item = args[i];
      if (i > 0) {
        this.emit(`, `);
      }
      this.visitExpr(item, level);
    }
    this.emit(')');
  }

  visitReturn(ast, level) {
    assert.equal(ast.type, 'return');
    this.emit('return ', level);
    this.visitExpr(ast.expr, level);
    this.emit(';\n');
  }

  visitRetry(ast, level) {
    assert.equal(ast.type, 'retry');
    this.emit('retry;\n', level);
  }

  visitIf(ast, level) {
    assert.equal(ast.type, 'if');
    this.emit('if (', level);
    this.visitExpr(ast.condition, level + 1);
    this.emit(') {\n');
    this.visitStmts(ast.stmts, level + 1);
    this.emit('}', level);

    // if (ast.elseStmts) {

    // }
    this.emit('\n');
    // TODO else if
    // TODO else
  }

  visitThrow(ast, level) {
    this.emit('throw ', level);
    this.visitObject(ast.expr, level);
    this.emit(';\n');
  }

  visitAssign(ast, level) {
    assert.equal(ast.type, 'assign');
    if (ast.left.type === 'id') {
      this.emit(`${_name(ast.left.id)}`, level);
    } else if (ast.left.type === 'variable') {
      this.emit(`${_name(ast.left.id)}`, level);
    } else if (ast.left.type === 'property_assign') {
      this.emit(`${_name(ast.left.id)}`, level);
      for (let i = 0; i < ast.left.propertyPath.length; i++) {
        this.emit(`.${_name(ast.left.propertyPath[i])}`);
      }
    } else if (ast.left.type === 'virtualVariable') {
      this.emit(`${_name(ast.left.vid)}`, level);
    } else if (ast.left.type === 'property') {
      this.emit(`${_name(ast.left.id)}`, level);
      for (let i = 0; i < ast.left.propertyPath.length; i++) {
        this.emit(`.${_name(ast.left.propertyPath[i])}`);
      }
    } else {
      console.log(ast);
      throw new Error('unimpelemented');
    }

    this.emit(` = `);
    this.visitExpr(ast.expr, level);
    this.emit(';\n');
  }

  visitDeclare(ast, level) {
    this.emit('var ', level);
    this.emit(`${_name(ast.id)}`);
    if (ast.expectedType) {
      this.emit(`: `);
      this.visitType(ast.expectedType);
    }
    this.emit(` = `);
    this.visitExpr(ast.expr, level);
    this.emit(';\n');
  }

  visitStmts(ast, level) {
    assert.equal(ast.type, 'stmts');
    let last;
    for (var i = 0; i < ast.stmts.length; i++) {
      const node = ast.stmts[i];
      if (last && node.type === 'if') {
        this.emit(`\n`);
      }
      this.visitStmt(node, level);
      last = node;
    }
  }

  visitReturnBody(ast, level) {
    assert.equal(ast.type, 'returnBody');
    this.visitStmts(ast.stmts, level);
  }
}

module.exports = Formatter;
