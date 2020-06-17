'use strict';

const fs = require('fs');
const path = require('path');

const DSL = require('@darabonba/parser');
const Command = require('../lib/command');
const printer = require('../lib/printer');
const helper = require('../lib/helper');
const config = require('../lib/config');
const generatorNameMap = config.generatorNameMap;
const generatorMap = {
  cs: require('@darabonba/csharp-generator'),
  ts: require('@darabonba/typescript-generator'),
  go: require('@darabonba/go-generator'),
  java: require('@darabonba/java-generator'),
  php: require('@darabonba/php-generator')
};

function generateCode(options) {
  const Generator = generatorMap[options.lang];
  const config = {
    ...options.pkg,
    pkgDir: options.rootDir,
    outputDir: options.outputDir,
    testFile: options.testFile,
    ...options.pkg[generatorNameMap[options.lang]]
  };
  const generator = new Generator(config);

  const filePath = path.join(options.rootDir, options.daraFile);
  const dsl = fs.readFileSync(filePath, 'utf8');
  const ast = DSL.parse(dsl, filePath);
  generator.visit(ast);
}

class CodegenCommand extends Command {
  constructor() {
    super({
      name: 'codegen',
      alias: ['gen'],
      desc: 'generate codes',
      args: [
        {
          name: 'lang',
          mode: 'required',
          desc: 'sdk language'
        },
        {
          name: 'outputDir',
          mode: 'required',
          desc: 'output dir path'
        },
        {
          name: 'sourceDir',
          mode: 'optional',
          desc: `Darafile file dir path`,
          default: process.cwd()
        }
      ],
      options: [],
    });
  }


  usage() {
    printer.println(printer.fgYellow);
    printer.println('Usage:');
    printer.println(printer.reset);
    printer.println('    dara codegen <lang> <outputDir> <sourceDir>');
    printer.println(printer.fgYellow);
    printer.println('Arguments:');
    printer.println(printer.reset);
    printer.print('    ').fixed('lang', 11).fixed(' : ', 3).fixed('required').println();
    printer.print('    ').fixed('outputDir', 11).fixed(' : ', 3).fixed('required').println();
    printer.print('    ').fixed('sourceDir', 11).fixed(' : ', 3).fixed('optional').println();
    printer.println();
  }

  async exec(args, options) {
    let lang = args.lang.toLowerCase();
    const outputDir = args.outputDir;
    const sourceDir = args.sourceDir;

    const rootDir = sourceDir;
    const pkgPath = helper.getDarafile(rootDir);
    const pkgContent = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(pkgContent);

    if (pkg.mode === 'interface') {
      printer.error(`The package is interface mode, the SDK can not be generated`);
      process.exit(-1);
    }

    let notSupported = true;
    if (!config.codegen[lang]) {
      Object.keys(config.codegen).forEach((key) => {
        if (config.codegen[key].indexOf(lang) > -1) {
          notSupported = false;
          lang = key;
        }
      });
    } else {
      notSupported = false;
    }

    if (notSupported) {
      printer.error(
        `The language '${lang}' not supported.`,
        `Only support languages: [${helper.supportedLang(config.codegen)}] `
      );
      process.exit(-1);
    }
    const Generator = generatorMap[options.lang];

    //generate from main dara code
    generateCode({
      pkg,
      rootDir,
      outputDir,
      lang,
      daraFile: pkg.main,
    });

    if (pkg.test && Generator.supportGenerateTest) {
      //generate from test dara code
      generateCode({
        pkg,
        rootDir,
        outputDir,
        lang,
        testFile: true,
        daraFile: pkg.test,
      });
    }
  }
}

module.exports = new CodegenCommand();
