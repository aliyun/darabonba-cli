'use strict';

const os = require('os');
const path = require('path');
const { existsSync } = require('fs');
exports.README_FILE = 'README.md';
exports.DARA_CONFIG_FILE = existsSync(path.join(os.homedir(), '.tearc'))
  ? path.join(os.homedir(), '.tearc') : path.join(os.homedir(), '.dararc');