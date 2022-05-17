'use strict';

const fs = require('fs');
const os = require('os');
const child_process = require('child_process');

const chalk = require('chalk');
const debug = require('debug')('dara:config');

const Command = require('../lib/command');
const {
  DARA_CONFIG_FILE
} = require('../lib/constants');

class ConfigCommand extends Command {
  constructor() {
    super({
      name: 'config',
      alias: [],
      desc: 'view or update configuration',
      args: [
        {
          name: 'action',
          mode: 'required',
          desc: 'config actions (set | get | delete | edit | list | ls )'
        },
        {
          name: 'key',
          mode: 'optional',
          desc: 'config key'
        },
        {
          name: 'value',
          mode: 'optional',
          desc: 'config value'
        }
      ],
      options: [
        {
          name: 'configurePath',
          short: 'c',
          mode: 'optional',
          desc: 'configure file path',
          default: DARA_CONFIG_FILE
        }
      ],
    });
  }

  usage() {
    console.log();
    console.log(chalk.yellow('Usage:'));
    console.log();
    console.log('    dara config set <key> <value>');
    console.log('    dara config get [<key>]');
    console.log('    dara config delete <key>');
    console.log('    dara config edit');
    console.log('    dara config list');
    console.log('    dara config ls');
    console.log('    dara config [action] -c <configFilePath>');
    console.log();
  }

  loadConfig() {
    let config = {};
    if (fs.existsSync(this.daraConfigFile)) {
      config = JSON.parse(fs.readFileSync(this.daraConfigFile, 'utf8'));
    }
    return config;
  }

  saveConfig(config) {
    fs.writeFileSync(this.daraConfigFile, JSON.stringify(config, null, 2));
  }

  async exec(args, options) {
    this.daraConfigFile = options.c;

    debug(`Using '${this.daraConfigFile}' as Dara config file`);

    switch (args.action) {
      case 'set':
        this.check(args.key, 'need config-key');
        this.check(args.value, 'config-key cannot be empty');
        this.set(args.key, args.value);
        break;
      case 'get':
        this.get(args.key);
        break;
      case 'delete':
        this.delete(args.key);
        break;
      case 'list':
      case 'ls':
        this.get();
        break;
      case 'edit':
        this.edit();
        break;
    }
  }

  set(key, value) {
    const config = this.loadConfig();
    config[key] = value;
    this.saveConfig(config);
    console.log();
    console.log(chalk.green('Update successfully!'));
    console.log();
    debug(`Saved config to ${this.daraConfigFile}`);
  }

  get(key) {
    const config = this.loadConfig();
    if (key === undefined) {
      console.log(JSON.stringify(config, null, 2));
    } else {
      console.log(JSON.stringify(config[key], null, 2));
    }
    debug(`Load config from ${this.daraConfigFile}`);
  }

  delete(key) {
    const config = this.loadConfig();
    delete config[key];
    this.saveConfig(config);
    console.log();
    console.log(chalk.green('Delete successfully!'));
    console.log();
    debug(`Updated config to ${this.daraConfigFile}`);
  }

  edit() {
    let cmd;
    let cmd2;
    switch (os.type()) {
      case 'Linux':
        cmd = 'vi ';
        cmd2 = 'nano ';
        break;
      case 'Darwin':
        cmd = 'open ';
        break;
      case 'Windows_NT':
        cmd = 'notepad ';
    }

    try {
      child_process.execSync(cmd + this.daraConfigFile);
      return;
    } catch (error) {
      // noop
    }

    if (cmd2) {
      try {
        child_process.execSync(cmd2 + this.daraConfigFile);
        return;
      } catch (error) {
        // noop
      }
    }

    console.log();
    console.log(chalk.red('No program found to open this file'));
    console.log();
  }
}

module.exports = new ConfigCommand();
