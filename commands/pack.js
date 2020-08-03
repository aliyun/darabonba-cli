'use strict';

const path = require('path');
const fs = require('fs');

const {
  PKG_FILE
} = require('../lib/constants');

const Command = require('../lib/command');
const printer = require('../lib/printer');
const { pack } = require('../lib/pack');

class PackCommand extends Command {
  constructor() {
    super({
      name: 'pack',
      alias: [],
      desc: 'pack the project as a *.tgz file',
      args: [],
      options: [
      ],
    });
  }

  async exec() {
    const rootDir = process.cwd();
    const pkgFilePath = path.join(rootDir, PKG_FILE);
    if (!fs.existsSync(pkgFilePath)) {
      printer.error('The Teafile does not exist');
      process.exit(-1);
    }

    const pkgContent = fs.readFileSync(pkgFilePath, 'utf8');
    const pkg = JSON.parse(pkgContent);
    const { scope, name, version } = pkg;
    if (!scope || !name || !version) {
      printer.error('The contents of the Teafile are incomplete.');
      printer.error('You can use `tea init` to initialize the file contents.');
      this.process.exit(-1);
    }

    pack(pkg, rootDir).catch((err) => {
      printer.error(err.stack);
      process.exit(-1);
    });
  }

  usage() {
    printer.println(printer.fgYellow);
    printer.println('Usage:');
    printer.println(printer.reset);
    printer.println('    tea pack');
    printer.println();
  }
}

module.exports = new PackCommand();
