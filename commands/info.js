'use strict';

const chalk = require('chalk');

const Command = require('../lib/command');

const {
  newRepoClient,
} = require('../lib/util.js');
const { DARA_CONFIG_FILE } = require('../lib/constants.js');

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
    console.log('    dara info <scope:moduleName>');
    console.log('    dara info <scope:moduleName:version>');
    console.log();
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
    const repoClient = await newRepoClient(this.options.c);
    const data = await repoClient.getModuleInfo(scope, moduleName, version);
    if (data.ok && data.moduleInfo.darafile) {
      const { moduleInfo } = data;
      const pkgInfo = JSON.parse(decodeURIComponent(moduleInfo.darafile));
      console.log(`${chalk.green(`${moduleInfo.scope}:${moduleInfo.name}@${moduleInfo.version}`)} info:`);
      console.log('');
      console.log(`main: ${chalk.yellow(pkgInfo.main)}`);
      console.log('');
      console.log('dist:');
      console.log(`.tarball: ${chalk.blue(moduleInfo.dist_tarball)}`);
      console.log(`.shasum:  ${chalk.blue(moduleInfo.dist_shasum)}`);
      console.log('');
      if (pkgInfo.libraries) {
        let keys = Object.keys(pkgInfo.libraries);
        if (keys.length > 0) {
          console.log('libraries:');
          keys.forEach(key => {
            console.log(`- ${chalk.magenta(`${key}: darafile.libariries`)}`);
          });
          console.log('');
        }
      }

      console.log('maintainers:');
      moduleInfo.maintainers.forEach(maintainer => {
        console.log(`- ${chalk.cyan(maintainer)}`);
      });
      console.log('');
      process.exit(0);
    }

    console.log(chalk.red(`the module ${scope}:${moduleName}@${version} isn't exists`));
    process.exit(1);
  }
}

module.exports = new InfoCommand();
