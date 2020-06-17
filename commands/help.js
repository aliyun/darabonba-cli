'use strict';

const Command = require('../lib/command');
const printer = require('../lib/printer');

const packageInfo = require('../package.json');

class HelpCommand extends Command {
  constructor() {
    super({
      name: 'help',
      alias: [],
      desc: 'print the help information',
      args: [],
      options: [],
    });
  }

  async exec(args, options, _, app) {
    printer.println();
    printer.print(printer.fgWhite);
    printer.print(packageInfo.description);
    printer.print(printer.fgGreen);
    printer.println(' ' + packageInfo.version);
    printer.println(printer.reset);
    printer.warning('Usage:');
    printer.println(`    dara <command> [<args>]\n`);
    printer.warning('Available commands:');

    const commands = app.commands;
    var maxCommandNameLength = 0;
    var maxCommandDescLength = 0;

    Object.keys(commands).forEach((key) => {
      const cmd = commands[key];
      const {name, desc} = cmd.config;
      if (name.length > maxCommandNameLength) {
        maxCommandNameLength = name.length;
      }
      if (desc.length > maxCommandDescLength) {
        maxCommandDescLength = desc.length;
      }
    });

    app.groups.forEach(({ title, commands }) => {
      printer.println(title);
      commands.forEach((cmd) => {
        const {name, desc} = cmd.config;
        printer.print(printer.fgGreen);
        printer.fixed('    ' + name, maxCommandNameLength + 4).print();
        printer.print(printer.reset);
        printer.println('    ' + desc);
      });
      printer.println();
    });

    printer.println();
  }
}

module.exports = new HelpCommand();
