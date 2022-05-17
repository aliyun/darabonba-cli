'use strict';

const path = require('path');
const fs = require('fs');

const chalk = require('chalk');

const {
  PKG_FILE
} = require('../lib/constants');
const Command = require('../lib/command');
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
      console.log();
      console.log(chalk.red('The Teafile does not exist'));
      console.log();
      process.exit(-1);
    }

    const pkgContent = fs.readFileSync(pkgFilePath, 'utf8');
    const pkg = JSON.parse(pkgContent);
    const { scope, name, version } = pkg;
    if (!scope || !name || !version) {
      console.log();
      console.log(chalk.red('The contents of the Darafile are incomplete.'));
      console.log(chalk.red('You can use `dara init` to initialize the file contents.'));
      console.log();
      this.process.exit(-1);
    }

    pack(pkg, rootDir).catch((err) => {
      console.log();
      console.log(chalk.red(err.stack));
      console.log();
      process.exit(-1);
    });
  }

  usage() {
    console.log();
    console.log(chalk.yellow('Usage:'));
    console.log();
    console.log('    dara pack');
    console.log();
  }
}

module.exports = new PackCommand();
