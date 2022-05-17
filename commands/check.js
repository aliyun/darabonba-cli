'use strict';

// natives
const path = require('path');
const fs = require('fs');

// thirds
const chalk = require('chalk');
const Darabonba = require('@darabonba/parser');

// locals
const Command = require('../lib/command');

class CheckCommand extends Command {
  constructor() {
    super({
      name: 'check',
      alias: [],
      desc: 'syntax check for dara file',
      args: [
        {
          name: 'filename',
          mode: 'required',
          desc: 'dara file path name',
          default: null
        }
      ],
      options: [
      ],
    });
  }

  async exec(args, options) {
    const filePath = path.resolve(args.filename);
    const source = fs.readFileSync(filePath, 'utf8');

    Darabonba.parse(source, filePath);

    console.log();
    console.log(chalk.green('Check success!'));
    console.log();
  }

  usage() {
    console.log(chalk.yellow('Usage:'));
    console.log();
    console.log('    dara check <filename.dara>');
    console.log();
  }
}

module.exports = new CheckCommand();
