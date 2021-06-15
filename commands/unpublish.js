'use strict';

const colors = require('colors/safe');

const Command = require('../lib/command');
const {
  requestHandler,
} = require('../lib/util.js');

class UnpublishCommand extends Command {
  constructor() {
    super({
      name: 'unpublish',
      alias: [],
      desc: 'unpublish the publish module',
      args: [
        {
          name: 'moduleInfo',
          mode: 'required',
          desc: 'the module info: <scope:moduleName:version> '
        }
      ],
      options: [
        {
          name: 'force',
          short: 'f',
          mode: 'optional',
          desc: 'delete the all module versions by this option',
          default: false
        }
      ],
    });
  }

  usage() {
    console.log();
    console.log(colors.yellow('Usage:'));
    console.log();
    console.log('    dara unpublish <scope:moduleName:version>');
    console.log('    dara unpublish <scope:moduleName> -f');
    console.log();
  }

  async exec(args, options) {
    let moduleInfo = args.moduleInfo.split(':');
    if (moduleInfo.length < 2) {
      console.log();
      console.log(colors.red('Bad augument: moduleInfo'));
      console.log();
      this.usage();
      process.exit(-1);
    }
    let [scope, moduleName, version] = moduleInfo;
    let data;
    if (!version) {
      if (!options.force) {
        console.log();
        console.log(colors.red('Bad augument: delete all module versions need -f to force delete!'));
        console.log();
        this.usage();
        process.exit(-1);
      }
      data = await requestHandler().deleteModule(scope, moduleName);
    } else {
      data = await requestHandler().deleteModuleVersion(scope, moduleName, version);
    }
    if (data.ok) {
      console.log();
      console.log(colors.green('Unpublish successfully!'));
      console.log();
    }
  }
}

module.exports = new UnpublishCommand();
