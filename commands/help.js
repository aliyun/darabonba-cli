'use strict';

const colors = require('colors/safe');

const Command = require('../lib/command');
const { fixed } = require('../lib/layout');

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
    console.log();
    console.log(colors.white(packageInfo.description) + ' ' + colors.green(packageInfo.version));
    console.log();
    console.log(colors.yellow('Usage:'));
    console.log();
    console.log(`    dara <command> [<args>]`);
    console.log();
    console.log(colors.yellow('Available commands:'));
    console.log();

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
      console.log(title);
      commands.forEach((cmd) => {
        const {name, desc} = cmd.config;
        console.log(`    ${colors.green(fixed(name, maxCommandNameLength))}    ${desc}`);
      });
      console.log();
    });

    if (app.groups.length === 0) {
      console.log();
    }
  }
}

module.exports = new HelpCommand();
