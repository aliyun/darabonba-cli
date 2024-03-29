'use strict';

const path = require('path');
const fs = require('fs');

const debug = require('debug')('dara:publish');
const chalk = require('chalk');
const {
  PublishModuleObject,
} = require('@darabonba/repo-client');
const { FileField } = require('@alicloud/tea-fileform');

const Command = require('../lib/command');
const { pack } = require('../lib/pack');
const { newRepoClient } = require('../lib/util');
const AstUtil = require('../lib/ast_util');
const {
  TEA_CONFIG_FILE
} = require('../lib/constants');
const { getPackageInfo } = require('../lib/darafile');

class PublishCommand extends Command {
  constructor() {
    super({
      name: 'publish',
      alias: [],
      desc: 'publish the dara package to repository',
      args: [],
      options: [
        {
          name: 'configurePath',
          short: 'c',
          mode: 'optional',
          desc: 'configure file path',
          default: TEA_CONFIG_FILE
        }
      ],
    });
  }

  async exec() {
    const pkgDir = process.cwd();
    const pkg = await getPackageInfo(pkgDir);
    if (!pkg) {
      console.log();
      console.log(chalk.red('It is not a Darabonba project'));
      console.log();
      process.exit(-1);
    }

    const moduleAst = new AstUtil(pkgDir, pkg);
    const { scope, name, version } = moduleAst.getPkg();
    if (!scope || !name || !version) {
      console.log();
      console.log(chalk.red('The contents of the Darafile are incomplete.'));
      console.log(chalk.red('You can use `dara init` to initialize the file contents.'));
      console.log();
      this.process.exit(-1);
    }
    const daraAst = moduleAst.getAstData();
    daraAst.score = moduleAst.getScore();
    const tgzFileName = `${scope}-${name}-${version}.tgz`;
    const tgzFilePath = path.join(pkgDir, tgzFileName);

    console.log(chalk.blue(`Packing the package(${scope}-${name}-${version})`));
    await pack(moduleAst.getPkg(), pkgDir);
    let tgzFileStream = fs.createReadStream(tgzFilePath);
    const { size } = fs.statSync(tgzFilePath);
    console.log(chalk.blue('uploading the pack file'));
    let fileInfo = new FileField({
      filename: tgzFileName,
      contentType: 'application/x-gzip',
      content: tgzFileStream
    });
    let moduleInfo = new PublishModuleObject({
      name,
      scope,
      version,
      darafile: JSON.stringify(moduleAst.getPkg()),
      readme: moduleAst.getReadme(),
      size,
      dara_ast: JSON.stringify(daraAst),
      file: fileInfo
    });
    debug(`Use ${this.options.c} as config file`);
    const client = await newRepoClient(this.options.c);
    let data = await client.publishModule(moduleInfo);
    if (data.ok) {
      console.log();
      console.log(chalk.green('Publish successfully!'));
      console.log();
      fs.unlinkSync(tgzFilePath);
      process.exit(0);
    }
  }

  usage() {
    console.log();
    console.log(chalk.yellow('Usage:'));
    console.log();
    console.log('    dara publish');
    console.log();
  }
}

module.exports = new PublishCommand();
