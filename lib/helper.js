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

module.exports = {
  _upperFirst,
  getDarafile,
  supportedLang
};
