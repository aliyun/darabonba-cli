'use strict';

const path = require('path');
const fs = require('fs');

const {
  readline
} = require('../lib/util');

const printer = require('../lib/printer');
const Command = require('../lib/command');
const helper = require('../lib/helper');

class InitCommand extends Command {
  constructor() {
    super({
      name: 'init',
      alias: [],
      desc: 'initialization package information',
      args: [],
      options: [
        {
          name: 'sourceDir',
          short: 's',
          mode: 'optional',
          desc: `Darafile dir path`,
          default: process.cwd()
        }
      ],
    });
  }

  usage() {
    printer.println(printer.fgYellow);
    printer.println('Usage:');
    printer.println(printer.reset);
    printer.println('    dara init -s <DaraFileSourceDir>');
    printer.println(printer.fgYellow);
    printer.println('Options:');
    printer.println(printer.reset);
    printer.print('    ').fixed('sourceDir', 9).fixed(' : ', 3).fixed('optional').println();
    printer.println();
  }

  async exec(args, options) {
    const pkgFilePath = helper.getDarafile(options.sourceDir);
    let obj = Object.create(null);
    if (fs.existsSync(pkgFilePath)) {
      var data = fs.readFileSync(pkgFilePath, 'utf8');
      obj = JSON.parse(data);
    }

    try {
      let oldScope = obj['scope'];
      obj['scope'] = await readline('package scope: ', oldScope);

      obj['name'] = await readline('package name: ', obj['name']);

      obj['version'] = await readline('package version: ', obj['version']);

      obj['main'] = await readline('main entry: ', obj['main']);
    } catch (err) {
      printer.error('Init Cancled!');
      process.exit(-1);
    }

    fs.writeFileSync(pkgFilePath, JSON.stringify(obj, null, '  '));

    const mainFilePath = path.join(options.sourceDir, obj['main']);
    if (!fs.existsSync(mainFilePath)) {
      // TODO: use a better template for dara file
      fs.writeFileSync(mainFilePath, '');
    }
  }
}

module.exports = new InitCommand();
