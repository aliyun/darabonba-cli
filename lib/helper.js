'use strict';

const config = require('./config');
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

function getGenerator(dir, generatorList, lang) {
  let Generator = null;
  if (config.codegen[lang]) {
    Generator = require(`./${dir}/${lang}.js`);
    return Generator;
  }
  Object.keys(config.codegen).forEach((key) => {
    if (config.codegen[key].indexOf(lang) > -1) {
      Generator = require(`./${dir}/${key}.js`);
    }
  });
  return Generator;
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
  getGenerator,
  getDarafile,
  supportedLang
};
