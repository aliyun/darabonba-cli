'use strict';

const chalk = require('chalk');

const defaultInfo = {
  name: '',
  short: '',
  mode: 'optional', // required | optional
  desc: '',
  default: null     // only supported optional mode
};

class Command {
  constructor(config) {
    this.config = {
      name: '',
      alias: [],
      desc: '',
      args: [],
      options: [],
      ...config
    };
    this.args = {};
    this.argv = [];
    this.options = {};
  }

  usage() { }

  hasOption(optionName) {
    return this.options[optionName] !== undefined;
  }

  addArgument(arg) {
    this.config.args.push({
      ...defaultInfo,
      ...arg
    });
  }

  addOption(option) {
    this.config.options.push({
      ...defaultInfo,
      ...option
    });
  }

  check(data, msg) {
    if (!data) {
      this.usage();
      console.log();
      var content = '';
      msg.forEach(str => {
        content += str + '\n';
      });
      console.log(chalk.red(content));
      process.exit(-1);
    }
  }

  exec() {
    throw new Error(`Please override exec : ${this.config.name} command`);
  }
}

module.exports = Command;
