'use strict';

function _upperFirst(str) {
  str = str.replace(/-/g, '_');
  return str[0].toUpperCase() + str.substring(1);
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

/**
 * gets fixed length content
 * @param {String} content to be paded content string
 * @param {Number} length total length
 * @returns
 */
function fixed(content, length = 10) {
  return (content || '').padEnd(length, ' ');
}

module.exports = {
  _upperFirst,
  supportedLang,
  isExecutable,
  fixed
};
