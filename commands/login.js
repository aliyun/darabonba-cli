'use strict';

const chalk = require('chalk');
const { UserObject } = require('@darabonba/repo-client');

const {
  newRepoClient,
  aesEncrypt,
  aesDecrypt,
  readline,
  getDaraConfig,
  saveDaraConfig
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

  async exec(args, options) {
    const obj = await getDaraConfig(options.c);

    if (obj['password']) {
      obj['password'] = aesDecrypt(obj['password']);
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
    const repoClient = await newRepoClient(this.options.c);
    let data = await repoClient.userLogin(user);
    if (data.ok) {
      obj['authToken'] = data.rev;
      obj['password'] = aesEncrypt(obj['password']);
      await saveDaraConfig(obj, options.c);
      console.log();
      console.log(chalk.green('Login Successfully!'));
      console.log();
    }
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
