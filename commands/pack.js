'use strict';

const chalk = require('chalk');

const Command = require('../lib/command');
const { pack } = require('../lib/pack');
const { getPackageInfo } = require('../lib/darafile');

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
    const pkg = await getPackageInfo(rootDir);
    if (!pkg) {
      console.log();
      console.log(chalk.red('It is not a Darabonba project'));
      console.log();
      process.exit(-1);
    }

    const { scope, name, version } = pkg;
    if (!scope || !name || !version) {
      console.log();
      console.log(chalk.red('The contents of the Darafile are incomplete.'));
      console.log(chalk.red('You can use `dara init` to initialize the file contents.'));
      console.log();
      this.process.exit(-1);
    }

    await pack(pkg, rootDir);
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
