'use strict';

const os = require('os');
const child_process = require('child_process');

const chalk = require('chalk');
const debug = require('debug')('dara:config');

const Command = require('../lib/command');
const { DARA_CONFIG_FILE } = require('../lib/constants');
const { getDaraConfig, saveDaraConfig } = require('../lib/util');

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
        await this.get(args.key);
        break;
      case 'delete':
        await this.delete(args.key);
        break;
      case 'list':
      case 'ls':
        await this.get();
        break;
      case 'edit':
        await this.edit();
        break;
    }
  }

  async set(key, value) {
    const config = await getDaraConfig(this.daraConfigFile);
    config[key] = value;
    await saveDaraConfig(config, this.daraConfigFile);
    console.log();
    console.log(chalk.green('Update successfully!'));
    console.log();
    debug(`Saved config to ${this.daraConfigFile}`);
  }

  async get(key) {
    const config = await getDaraConfig(this.daraConfigFile);
    if (key === undefined) {
      console.log(JSON.stringify(config, null, 2));
    } else {
      console.log(JSON.stringify(config[key], null, 2));
    }
    debug(`Load config from ${this.daraConfigFile}`);
  }

  async delete(key) {
    const config = await getDaraConfig(this.daraConfigFile);
    delete config[key];
    await saveDaraConfig(config, this.daraConfigFile);
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
