'use strict';

const chalk = require('chalk');

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
