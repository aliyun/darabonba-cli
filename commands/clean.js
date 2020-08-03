'use strict';

const path = require('path');
const fs = require('fs');

const printer = require('../lib/printer');
const Command = require('../lib/command');
const { delDir } = require('../lib/util');
const { PKG_FILE } = require('../lib/constants');

class CleanCommand extends Command {
  constructor() {
    super({
      name: 'clean',
      alias: [],
      desc: 'clean the libraries folder',
      args: [
        {
          name: 'sourceDir',
          mode: 'optional',
          desc: `${PKG_FILE} file dir path`,
          default: process.cwd()
        }
      ],
      options: [
      ],
    });
  }

  async exec(args, options) {
    const sourceDir = args.sourceDir;
    const pkgPath = path.join(sourceDir, PKG_FILE);
    if (!fs.existsSync(pkgPath)) {
      printer.error(`Not a Tea package folder`);
      process.exit(-1);
    }

    const libPath = path.join(sourceDir, 'libraries');
    delDir(libPath);
    printer.success(`Clean ${libPath} success !`);
    const libLockPath = path.join(sourceDir, '.libraries.json');
    if (fs.existsSync(libLockPath)) {
      fs.unlinkSync(libLockPath);
      printer.success(`Clean ${libLockPath} success !`);
    }
  }

  usage() {
    printer.println(printer.fgYellow);
    printer.println('Usage:');
    printer.println(printer.reset);
    printer.println('    tea clean');
    printer.println();
  }
}

module.exports = new CleanCommand();
