'use strict';

const path = require('path');
const fs = require('fs');
const util = require('util');

const chalk = require('chalk');

const Command = require('../lib/command');
const { isDaraProject } = require('../lib/darafile');

const rmdirAsync = util.promisify(fs.rm);

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
          desc: `the root folder of darabonba project`,
          default: process.cwd()
        }
      ],
      options: [
      ],
    });
  }

  async exec(args, options) {
    const sourceDir = args.sourceDir;
    if (!await isDaraProject(sourceDir)) {
      console.log();
      console.log(chalk.red(`Not a Darabonba package folder`));
      console.log();
      process.exit(-1);
    }

    const libPath = path.join(sourceDir, 'libraries');
    await rmdirAsync(libPath, {
      recursive: true
    });
    console.log();
    console.log(chalk.green(`Clean ${libPath} success!`));
    console.log();
    const libLockPath = path.join(sourceDir, '.libraries.json');
    if (fs.existsSync(libLockPath)) {
      fs.unlinkSync(libLockPath);
      console.log();
      console.log(chalk.green(`Clean ${libLockPath} success!`));
      console.log();
    }
  }

  usage() {
    console.log();
    console.log(chalk.yellow('Usage:'));
    console.log();
    console.log('    dara clean');
    console.log();
  }
}

module.exports = new CleanCommand();
