'use strict';

// natives
const path = require('path');
const fs = require('fs');

// thirds
const chalk = require('chalk');
const Darabonba = require('@darabonba/parser');
// locals
const Command = require('../lib/command');
const { fixed } = require('../lib/helper');

class BuildCommand extends Command {
  constructor() {
    super({
      name: 'build',
      alias: [],
      desc: 'build ast file for dara file',
      args: [],
      options: [
        {
          name: 'filename',
          short: 'f',
          mode: 'required',
          desc: 'dara file path name',
          default: null
        },
        {
          name: 'output',
          short: 'o',
          mode: 'optional',
          desc: 'output ast file path name',
          default: null
        }
      ],
    });
  }

  async exec(args, options) {
    const filePath = path.resolve(options.filename);
    const source = fs.readFileSync(filePath, 'utf8');

    const ast = Darabonba.parse(source, filePath);
    if (options.output) {
      if (!fs.existsSync(path.dirname(options.output))) {
        fs.mkdirSync(path.dirname(options.output), { recursive: true });
      }
      fs.writeFileSync(options.output, JSON.stringify(ast, null, 2));
      console.log();
      console.log(chalk.green('Built successfully!'));
      console.log(chalk.green('Save Path : ' + path.resolve(options.output)));
      console.log();
    } else {
      console.log();
      console.log(JSON.stringify(ast, null, 2));
      console.log();
    }
  }

  usage() {
    console.log();
    console.log(chalk.yellow('Usage:'));
    console.log();
    console.log('    dara build -f <filename.dara> -o <outputAstFile>');
    console.log();
    console.log(chalk.yellow('Options:'));
    console.log();
    console.log(`    ${fixed('-f, --filename', 22)} : required`);
    console.log(`    ${fixed('-o, --output', 22)} : optional`);
    console.log();
  }
}

module.exports = new BuildCommand();
