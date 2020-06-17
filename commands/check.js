'use strict';

const printer = require('../lib/printer');
const Command = require('../lib/command');
const Darabonba = require('@darabonba/parser');
const path = require('path');
const fs = require('fs');

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
    printer.success('Check success !');
  }

  usage() {
    printer.println(printer.fgYellow);
    printer.println('Usage:');
    printer.println(printer.reset);
    printer.println('    dara check <filename.dara>');
    printer.println();
  }
}

module.exports = new CheckCommand();
