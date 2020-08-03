'use strict';

const path = require('path');
const fs = require('fs');

const debug = require('debug')('dara:publish');
const {
  PublishModuleObject,
} = require('@darabonba/repo-client');
const { FileField } = require('@alicloud/tea-fileform');

const Command = require('../lib/command');
const printer = require('../lib/printer');
const { pack } = require('../lib/pack');
const { requestHandler } = require('../lib/util');
const AstUtil = require('../lib/ast_util');
const {
  PKG_FILE,
  TEA_CONFIG_FILE
} = require('../lib/constants');

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
    this.publish().catch((err) => {
      printer.error(err.stack);
      process.exit(-1);
    });
  }

  async publish() {
    const pkgDir = process.cwd();
    const pkgFilePath = path.join(pkgDir, PKG_FILE);
    // Check the Teafile
    if (!fs.existsSync(pkgFilePath)) {
      printer.error('The Teafile does not exist');
      process.exit(-1);
    }
    const moduleAst = new AstUtil(pkgDir);
    const { scope, name, version } = moduleAst.getPkg();
    if (!scope || !name || !version) {
      printer.error('The contents of the Teafile are incomplete.');
      printer.error('You can use `dara init` to initialize the file contents.');
      this.process.exit(-1);
    }
    const daraAst = moduleAst.getAstData();
    daraAst.score = moduleAst.getScore();
    const tgzFileName = `${scope}-${name}-${version}.tgz`;
    const tgzFilePath = path.join(pkgDir, tgzFileName);

    printer.info(`Packing the package(${scope}-${name}-${version})`);
    await pack(moduleAst.getPkg(), pkgDir);
    let tgzFileStream = fs.createReadStream(tgzFilePath);
    const { size } = fs.statSync(tgzFilePath);
    printer.info('uploading the pack file');
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
    const client = requestHandler(this.options.c);
    let data = await client.publishModule(moduleInfo);
    if (data.ok) {
      printer.success('Publish successfully!');
      fs.unlinkSync(tgzFilePath);
      process.exit(0);
    }
  }

  usage() {
    printer.println(printer.fgYellow);
    printer.println('Usage:');
    printer.println(printer.reset);
    printer.println('    dara publish');
    printer.println();
  }
}

module.exports = new PublishCommand();
