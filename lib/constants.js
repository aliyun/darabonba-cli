'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs');
const pkgPath = path.join(process.cwd(), 'Darafile');
exports.PKG_FILE = fs.existsSync(pkgPath) ? 'Darafile' : 'Teafile';
exports.README_FILE = 'README.md';
exports.DARA_CONFIG_FILE = path.join(os.homedir(), '.dararc');
exports.DARA_IGNORE_FILE = '.daraignore';
exports.INSTALL_PATH = 'libraries';
exports.AES_KEY = '891f521na5c7l921';
exports.AES_IV = '5325852002076792';