'use strict';

const fs = require('fs');
const path = require('path');

const chalk = require('chalk');
const DSL = require('@darabonba/parser');

const Command = require('../lib/command');
const { getDarafile, isExecutable, supportedLang, fixed } = require('../lib/helper');
const config = require('../lib/config');

const generatorNameMap = config.generatorNameMap;
const generatorMap = {
  cs: require('@darabonba/csharp-generator'),
  ts: require('@darabonba/typescript-generator'),
  go: require('@darabonba/go-generator'),
  java: require('@darabonba/java-generator'),
  'java-async': require('@darabonba/java-async-generator'),
  php: require('@darabonba/php-generator'),
  py: require('@darabonba/python-generator'),
  py2: require('@darabonba/python-generator'),
  cpp: require('@darabonba/cpp-generator'),
  swift: require('@darabonba/swift-generator'),
};

function generateCode(options) {
  const Generator = generatorMap[options.lang];
  const config = {
    ...options.pkg,
    pkgDir: options.rootDir,
    outputDir: options.outputDir,
    testFile: options.testFile,
    exec: options.exec,
    ...options.pkg[generatorNameMap[options.lang]]
  };
  const langSubVersionMap = {
    py2: 'python2'
  };
  const generator =
    langSubVersionMap[options.lang] ?
      new Generator(config, langSubVersionMap[options.lang])
      : new Generator(config);

  const filePath = path.join(options.rootDir, options.daraFile);
  const dsl = fs.readFileSync(filePath, 'utf8');
  const ast = DSL.parse(dsl, filePath);
  if (config.exec === true && !isExecutable(ast)) {
    console.log();
    console.log(chalk.red(`There is no static main function in dara, exec option can't be used!`));
    console.log();
    process.exit(-1);
  }
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
      options: [
        {
          name: 'exec',
          short: 'e',
          mode: 'optional',
          desc: 'generate the executable codes',
          default: false
        },
      ],
    });
  }


  usage() {
    console.log();
    console.log(chalk.yellow('Usage:'));
    console.log();
    console.log('    dara codegen <lang> <outputDir> <sourceDir>');
    console.log();
    console.log(chalk.yellow('Arguments:'));
    console.log();
    console.log(`    ${fixed('lang', 11)} : ${fixed('required')}`);
    console.log(`    ${fixed('outputDir', 11)} : ${fixed('required')}`);
    console.log(`    ${fixed('sourceDir', 11)} : ${fixed('optional')}`);
    console.log();
  }

  async exec(args, options) {
    let lang = args.lang.toLowerCase();
    const outputDir = args.outputDir;
    const sourceDir = args.sourceDir;

    const rootDir = sourceDir;
    const pkgPath = getDarafile(rootDir);
    const pkgContent = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(pkgContent);

    if (pkg.mode === 'interface') {
      console.log();
      console.log(chalk.red(`The package is interface mode, the SDK can not be generated`));
      console.log();
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
      console.log();
      console.log(chalk.red(`The language '${lang}' not supported.`));
      console.log(chalk.red(`Only support languages: [${supportedLang(config.codegen)}]`));
      console.log();
      process.exit(-1);
    }

    const Generator = generatorMap[lang];
    //generate from main dara code
    generateCode({
      pkg,
      rootDir,
      outputDir,
      lang,
      daraFile: pkg.main,
      exec: options.exec,
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
