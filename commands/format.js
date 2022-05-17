'use strict';

const fs = require('fs');
const path = require('path');

const chalk = require('chalk');
const Darabonba = require('@darabonba/parser');

const Command = require('../lib/command');
const Formatter = require('../lib/formatter');

class FormatCommand extends Command {
  constructor() {
    super({
      name: 'format',
      alias: [],
      desc: 'format the dara source file',
      args: [
        {
          name: 'source',
          mode: 'required',
          desc: 'source file'
        }
      ],
      options: [],
    });
  }

  usage() {
    console.log();
    console.log(chalk.yellow('Usage:'));
    console.log();
    console.log('    dara format <filename.dara>');
    console.log();
  }

  async exec(args, options) {
    const filePath = path.resolve(args.source);
    const sourceCode = fs.readFileSync(filePath, 'utf8');
    const ast = Darabonba.parse(sourceCode, filePath);
    const formatter = new Formatter();
    formatter.visit(ast, 0);
    fs.writeFileSync(filePath, formatter.output);
  }
}

module.exports = new FormatCommand();
