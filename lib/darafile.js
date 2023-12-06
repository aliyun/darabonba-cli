'use strict';

const path = require('path');
const util = require('util');
const fs = require('fs');

const existsAsync = util.promisify(fs.exists);
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

async function isDaraProject(dir) {
  const darafilePath = path.join(dir, 'Darafile');
  if (await existsAsync(darafilePath)) {
    return true;
  }
  // 向下兼容
  const teafilePath = path.join(dir, 'Teafile');
  if (await existsAsync(teafilePath)) {
    return true;
  }
  
  return false;
}

async function getDarafile(dir) {
  const darafilePath = path.join(dir, 'Darafile');
  if (await existsAsync(darafilePath)) {
    return darafilePath;
  }
  // 向下兼容
  const teafilePath = path.join(dir, 'Teafile');
  if (await existsAsync(teafilePath)) {
    return teafilePath;
  }

  return null;
}

async function getPackageInfo(dir) {
  const pkgPath = await getDarafile(dir);
  if (pkgPath) {
    const content = await readFileAsync(pkgPath, 'utf-8');
    return JSON.parse(content);
  }

  return null;
}

async function savePackageInfo(dir, pkg) {
  const pkgFilePath = await getDarafile(dir);
  await writeFileAsync(pkgFilePath, JSON.stringify(pkg, null, '  '));
}

module.exports = {
  isDaraProject,
  getPackageInfo,
  savePackageInfo
};
