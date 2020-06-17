'use strict';

const printer = require('../lib/printer');
const Command = require('../lib/command');
const Darabonba = require('@darabonba/parser');
const path = require('path');
const fs = require('fs');

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
      printer.success(
        'Built successfully !',
        'Save Path : ' + path.resolve(options.output)
      );
    } else {
      printer.println();
      printer.println(JSON.stringify(ast, null, 2));
      printer.println();
    }
  }

  usage() {
    printer.println(printer.fgYellow);
    printer.println('Usage:');
    printer.println(printer.reset);
    printer.println('    dara build -f <filename.dara> -o <outputAstFile>');
    printer.println(printer.fgYellow);
    printer.println('Options:');
    printer.println(printer.reset);
    printer.print('    ').fixed('filename', 11).fixed(' : ', 3).fixed('required').println();
    printer.print('    ').fixed('output', 11).fixed(' : ', 3).fixed('optional').println();
    printer.println();
  }
}

module.exports = new BuildCommand();
