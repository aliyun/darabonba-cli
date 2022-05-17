'use strict';

const path = require('path');
const fs = require('fs');
const tar = require('tar');
const crypto = require('crypto');

const chalk = require('chalk');
const { DownloadModuleObject } = require('@darabonba/repo-client');

const { request, requestHandler } = require('../lib/util');
const { PKG_FILE, INSTALL_PATH, DARA_CONFIG_FILE } = require('../lib/constants');
const Command = require('../lib/command');

function isOverseas() {
  if (!fs.existsSync(DARA_CONFIG_FILE)) {
    return '';
  }
  let config = JSON.parse(fs.readFileSync(DARA_CONFIG_FILE, { encoding: 'utf8' }));
  return config.overseas || false;
}

function downloadAndCheckShasum(upstream, downstream) {
  let onEnd, onError, cleanUp;
  return new Promise((resolve, reject) => {
    upstream.pipe(downstream);
    let hasher = crypto.createHash('sha1');
    function onData(chunk) {
      hasher.update(chunk);
    }
    onEnd = function () {
      let shasum = hasher.digest('hex');
      cleanUp();
      resolve(shasum);
    };

    onError = function (err) {
      cleanUp();
      reject(err);
    };

    cleanUp = function () {
      upstream.removeListener('data', onData);
      upstream.removeListener('end', onEnd);
      upstream.removeListener('error', onError);
    };

    upstream.on('data', onData);
    upstream.on('end', onEnd);
    upstream.on('error', onError);
  });
}

async function downloadModules(ctx, rootDir, downloadList) {
  if (!downloadList || !downloadList.length) {
    return [];
  }

  let moduleDirs = [];
  for (let [, moduleInfo] of Object.entries(downloadList)) {
    if (!moduleInfo || !moduleInfo.dist_tarball) {
      continue;
    }
    let distTarball = moduleInfo.dist_tarball;
    if (isOverseas()) {
      distTarball = distTarball.replace('oss-cn-zhangjiakou', 'oss-accelerate');
    }
    let { res } = await request(distTarball, {
      streaming: true,
      followRedirect: true,
    });
    // windows can't support ':' in file path
    let targetDir = path.join(rootDir, INSTALL_PATH, moduleInfo.dist_dir.replace(/:/g, '_'));
    ctx.librariesMap[moduleInfo.version] = path.relative(rootDir, targetDir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, {
        recursive: true
      });
    }

    let shasum = await downloadAndCheckShasum(res, tar.x({
      sync: true,
      C: targetDir
    }));

    if (moduleInfo.dist_shasum !== shasum) {
      console.log();
      console.log(chalk.red(`Bad Download File: ${moduleInfo.version} the download module check shasum error!`));
      console.log();
      process.exit(-1);
    }
    moduleDirs.push(targetDir);
  }

  return moduleDirs;
}

async function checkInstall(ctx, libs, aliasId, pwd) {
  const original = ctx.librariesMap[aliasId];
  if (!original) {
    return true;
  }

  if (pwd !== process.cwd()) {
    return false;
  }

  if (!original.version) {
    // be local before or fist add lib
    return true;
  }

  if (original.version !== libs[aliasId]) {
    return true;
  }
  return false;
}

async function getLibsFromTeaFile(ctx, pwd) {
  const pkgPath = fs.existsSync(path.join(pwd, 'Darafile')) ? path.join(pwd, 'Darafile') : path.join(pwd,'Teafile');
  if (!fs.existsSync(pkgPath)) {
    return [];
  }

  const pkgContent = fs.readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(pkgContent);
  const libraries = pkg.libraries || {};
  const aliasIds = Object.keys(libraries);
  console.log(chalk.blue(`${pkgPath} found ${aliasIds.length} libraries`));
  let installArr = [];
  aliasIds.forEach((aliasId) => {
    if (!aliasId) {
      return;
    }

    const libPath = libraries[aliasId];
    if (libPath.startsWith('./') || libPath.startsWith('../') || libPath.startsWith('/')) {
      console.log(chalk.blue(`found ${aliasId} => ${libPath}`));
      ctx.localCount++;
      //local directly overwrite
      ctx.librariesMap[aliasId] = libPath;
    } else {
      //remote will check install or not
      let install = checkInstall(ctx, libraries, aliasId, pwd);
      if (!install) {
        return;
      }

      ctx.remoteCount++;
      let libInfo = libraries[aliasId];
      if (!libInfo) {
        return;
      }

      installArr.push(libInfo);
    }
  });

  console.log(chalk.blue('fetching from remote repository'));
  return installArr;
}

async function getDownloadList(installArr) {
  let downloadInfo = new DownloadModuleObject({
    specs: installArr.join(',')
  });
  let data = await requestHandler().downloadModule(downloadInfo);
  if (data.ok) {
    let downloadList = data.download_list;
    return downloadList;
  }
}

async function installByLibs(ctx, rootDir, installArr) {
  let downloadList = await getDownloadList(installArr);
  let downloadModuleDirs = await downloadModules(ctx, rootDir, downloadList);
  if (!downloadModuleDirs.length) {
    return;
  }

  installArr = [];
  for (let [, moduleDir] of Object.entries(downloadModuleDirs)) {
    let tmpList = await getLibsFromTeaFile(ctx, moduleDir);
    if (!tmpList || !tmpList.length) {
      continue;
    }

    installArr = installArr.concat(tmpList);
  }

  if (!installArr.length) {
    return;
  }

  await installByLibs(ctx, rootDir, installArr);
}

class InstallCommand extends Command {
  constructor() {
    super({
      name: 'install',
      alias: [],
      desc: 'install the dependencies from repository',
      args: [],
      options: [
        {
          name: 'force',
          short: 'f',
          mode: 'optional',
          desc: 'force to install modules',
          default: false
        },
        {
          name: 'save',
          short: 'S',
          mode: 'optional',
          desc: 'Download module and update teafile',
          default: false
        },
      ],
    });
  }

  async exec(args, options, argv) {
    const rootDir = process.cwd();
    let pkgPath = path.join(rootDir, PKG_FILE);
    if (!fs.existsSync(pkgPath)) {
      console.log();
      console.log(chalk.red(`This folder is not a Darabonba package project(No Darafile exist)`));
      console.log();
      process.exit(-1);
    }

    const ctx = {
      librariesMap: {},
      localCount: 0,
      remoteCount: 0
    };
    const libraryPath = path.join(rootDir, '.libraries.json');
    if (argv[0]) {
      let installArr = [];
      let moduleName;
      installArr.push(argv[0]);
      if (fs.existsSync(libraryPath)) {
        let libraryContent = fs.readFileSync(libraryPath);
        ctx.librariesMap = JSON.parse(libraryContent);
      }
      await installByLibs(ctx, rootDir, installArr);
      fs.writeFileSync(libraryPath, JSON.stringify(ctx.librariesMap, null, 2));
      if (options.save) {
        if (argv[1]) {
          moduleName = argv[1];
        } else {
          let [, name,] = argv[0].split(':');
          if (!name) {
            console.log();
            console.log(chalk.red(`Unrecognized module path: ${argv[0]}, ` +
              `expected module path format: <scope:module[:version]>.`));
            console.log();
            process.exit(-1);
          }
          moduleName = name;
        }
        const pkgContent = fs.readFileSync(pkgPath, 'utf8');
        let pkg = JSON.parse(pkgContent);
        pkg.libraries = pkg.libraries || {};
        pkg.libraries[moduleName] = argv[0];
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      }
      console.log(chalk.blue(`1 libraries installed.`));
    } else {
      if (!options.force && fs.existsSync(libraryPath)) {
        let libraryContent = fs.readFileSync(libraryPath);
        ctx.librariesMap = JSON.parse(libraryContent);
      }

      const installArr = await getLibsFromTeaFile(ctx, rootDir);
      await installByLibs(ctx, rootDir, installArr);
      if (Object.keys(ctx.librariesMap).length > 0) {
        const lockPath = path.join(rootDir, '.libraries.json');
        fs.writeFileSync(lockPath, JSON.stringify(ctx.librariesMap, null, 2));
      }

      console.log(chalk.blue(`${ctx.localCount + ctx.remoteCount} libraries installed.` +
        ` (${ctx.localCount} local, ${ctx.remoteCount} remote)`));
      process.exit(0);
    }
  }

  usage() {
    console.log();
    console.log(chalk.yellow('Usage:'));
    console.log();
    console.log('    dara install');
    console.log('    dara install -f');
    console.log('    dara install -S <modulePath> [moduleAlias]');
    console.log();
  }
}

module.exports = new InstallCommand();
