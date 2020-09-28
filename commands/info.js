'use strict';

const Command = require('../lib/command');
const printer = require('../lib/printer');
const {
  requestHandler,
} = require('../lib/util.js');

class InfoCommand extends Command {
  constructor() {
    super({
      name: 'info',
      alias: [],
      desc: 'get the info of a dara scope or a dara pakcage',
      args: [
        {
          name: 'module',
          mode: 'required',
          desc: 'dara scope or module'
        },
      ],
      options: [],
    });
  }

  usage() {
    printer.println(printer.fgYellow);
    printer.println('Usage:');
    printer.println(printer.reset);
    printer.println('    dara info <scope:moduleName>');
    printer.println('    dara info <scope:moduleName:version>');
    printer.println();
  }

  async exec(args, options, argv) {
    const module = args.module;
    let [scope, moduleName, version] = module.split(':');
    if (!scope || !moduleName) {
      this.usage();
      process.exit(-1);
    }
    version = version || 'latest';
    await this.getModuleInfo(scope, moduleName, version);
  }

  async getModuleInfo(scope, moduleName, version) {
    const data = await requestHandler().getModuleInfo(scope, moduleName, version);
    if (data.ok) {
      const { moduleInfo } = data;
      const pkgInfo = JSON.parse(decodeURIComponent(moduleInfo.darafile));
      printer.println(`${printer.fgGreen}${moduleInfo.scope}:` +
        `${moduleInfo.name}: ${moduleInfo.version} ${printer.reset} info:`);
      printer.println('');
      printer.println(`- main: ${printer.fgYellow}${pkgInfo.main}${printer.reset}`);
      printer.println('');
      printer.println('- dist:');
      printer.println(`-   tarball: ${printer.fgBlue}${moduleInfo.dist_tarball} ${printer.reset}`);
      printer.println(`-   shasum:  ${printer.fgBlue}${moduleInfo.dist_shasum} ${printer.reset}`);
      printer.println('');
      if (pkgInfo.libraries instanceof Object) {
        let keys = Object.keys(pkgInfo.libraries);
        if (keys.length > 0) {
          printer.println('- libraries:');
          keys.forEach(key => {
            printer.println(`-    ${printer.fgMagenta} ${key}: darafile.libariries ${printer.reset}`);
          });
          printer.println('');
        }
      }

      printer.println('- maintainers:');
      moduleInfo.maintainers.forEach(maintainer => {
        printer.println(`-    ${printer.fgCyan} ${maintainer} ${printer.reset}`);
      });
      printer.println('');
      process.exit(0);
    }
  }
}

module.exports = new InfoCommand();
