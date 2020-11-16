'use strict';

const path = require('path');
const fs = require('fs');

function _upperFirst(str) {
  str = str.replace(/-/g, '_');
  return str[0].toUpperCase() + str.substring(1);
}

// be compatible with the TeaDSL version
function getDarafile(dir) {
  return fs.existsSync(path.join(dir, 'Teafile')) ? path.join(dir, 'Teafile') : path.join(dir, 'Darafile');
}

function supportedLang(configObj) {
  var supported = '';
  Object.keys(configObj).forEach((key) => {
    supported += key + ', ';
  });
  return supported.slice(0, supported.length - 2);
}

function isExecutable(ast) {
  const nodes = ast.moduleBody.nodes;
  const ret = nodes.filter(node => {
    if (node.type !== 'function') {
      return false;
    }

    if (node.functionName.lexeme === 'main' &&
      node.isStatic && node.isAsync && node.functionBody) {
      return node;
    }
  });
  return !!ret.length;
}

module.exports = {
  _upperFirst,
  getDarafile,
  supportedLang,
  isExecutable,
};
