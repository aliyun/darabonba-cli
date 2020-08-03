'use strict';

const fs = require('fs');

const {
  UserObject,
} = require('@darabonba/repo-client');

const {
  requestHandler,
  aesEncrypt,
  aesDecrypt,
  readline
} = require('../lib/util');
const { DARA_CONFIG_FILE } = require('../lib/constants');
const Command = require('../lib/command');
const printer = require('../lib/printer');

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
      printer.error('Login Cancled!');
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
      printer.success('Login Successfully!');
    }
  }

  async exec() {
    this.login().catch((err) => {
      printer.error(err.stack);
      process.exit(-1);
    });
  }

  usage() {
    printer.println(printer.fgYellow);
    printer.println('Usage:');
    printer.println(printer.reset);
    printer.println('    tea login');
    printer.println('    tea adduser');
    printer.println();
  }
}

module.exports = new LoginCommand();
