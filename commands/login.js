'use strict';

const fs = require('fs');

const chalk = require('chalk');
const { UserObject } = require('@darabonba/repo-client');

const {
  requestHandler,
  aesEncrypt,
  aesDecrypt,
  readline
} = require('../lib/util');
const { DARA_CONFIG_FILE } = require('../lib/constants');
const Command = require('../lib/command');

class LoginCommand extends Command {
  constructor() {
    super({
      name: 'login',
      desc: 'login to repository',
      args: [],
      options: [
      ],
    });
  }

  async login() {
    let obj = {};
    if (fs.existsSync(DARA_CONFIG_FILE)) {
      obj = JSON.parse(fs.readFileSync(DARA_CONFIG_FILE, 'utf8'));
      if (obj['password']) {
        obj['password'] = aesDecrypt(obj['password']);
      }
    }
    try {
      obj['username'] = await readline('username:', obj['username'], {
        retry: true
      });

      obj['password'] = await readline('password:', obj['password'], {
        silent: true,
        retry: true
      });

      obj['email'] = await readline('email:', obj['email'], {
        retry: true
      });
    } catch (err) {
      console.log();
      console.log(chalk.red('Login Cancled!'));
      console.log();
      process.exit(-1);
    }

    let user = new UserObject({
      username: obj['username'],
      email: obj['email'],
      password: obj['password']
    });
    let data = await requestHandler().userLogin(user);
    if (data.ok) {
      obj['authToken'] = data.rev;
      obj['password'] = aesEncrypt(obj['password']);
      fs.writeFileSync(DARA_CONFIG_FILE, JSON.stringify(obj, null, 2));
      console.log();
      console.log(chalk.green('Login Successfully!'));
      console.log();
    }
  }

  async exec() {
    this.login().catch((err) => {
      console.log();
      console.log(chalk.red(err.stack));
      console.log();
      process.exit(-1);
    });
  }

  usage() {
    console.log();
    console.log(chalk.yellow('Usage:'));
    console.log();
    console.log('    dara login');
    console.log('    dara adduser');
    console.log();
  }
}

module.exports = new LoginCommand();
