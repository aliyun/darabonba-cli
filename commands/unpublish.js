'use strict';


const Command = require('../lib/command');
const printer = require('../lib/printer');
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
    printer.println(printer.fgYellow);
    printer.println('Usage:');
    printer.println(printer.reset);
    printer.println('    dara unpublish <scope:moduleName:version>');
    printer.println('    dara unpublish <scope:moduleName> -f');
    printer.println();
  }

  async exec(args, options) {
    let moduleInfo = args.moduleInfo.split(':');
    if (moduleInfo.length < 2) {
      printer.error('Bad augument: moduleInfo');
      this.usage();
      process.exit(-1);
    }
    let [scope, moduleName, version] = moduleInfo;
    let data;
    if (!version) {
      if (!options.force) {
        printer.error('Bad augument: delete all module versions need -f to force delete!');
        this.usage();
        process.exit(-1);
      }
      data = await requestHandler().deleteModule(scope, moduleName);
    } else {
      data = await requestHandler().deleteModuleVersion(scope, moduleName, version);
    }
    if (data.ok) {
      printer.success('Unpublish successfully!');
    }
  }
}

module.exports = new UnpublishCommand();
