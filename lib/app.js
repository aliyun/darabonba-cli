'use strict';

const minimist = require('minimist');
const chalk = require('chalk');

const { fixed } = require('./layout');

function color(content) {
  return chalk.bgRed(chalk.white(content));
}

class CommandsApplication {
  constructor(groups) {
    this.groups = groups;
    this.commands = {};
    for (let i = 0; i < this.groups.length; i++) {
      const group = this.groups[i];
      for (let j = 0; j < group.commands.length; j++) {
        const cmd = group.commands[j];
        this.commands[cmd.config.name] = cmd;
      }
    }
  }

  run() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
      this.showHelp();
      return;
    }

    const commandName = args[0];
    if (this.commands[commandName]) {
      this.exec(this.commands[commandName]);
      return;
    }

    const matched = [];
    Object.keys(this.commands).forEach((key) => {
      if (key.indexOf(commandName) !== -1) {
        matched.push(this.commands[key]);
      }
    });

    if (matched.length === 0) {
      this.showHelp();
    } else {
      this.showAmbiguous(commandName, matched);
    }
    console.log();
    console.log(chalk.red(`dara: '${commandName}' is not a dara command. See 'dara help'.`));
    console.log();
    process.exit(-1);
  }

  exec(command) {
    const args = process.argv.slice(3);

    var commandArgs = command.config.args;
    var commandOpts = command.config.options;

    // set option alias
    var aliasOption = {
      help: 'h'
    };
    var checkSet = [];
    commandOpts.forEach(opt => {
      if (checkSet.indexOf(opt.name) > -1) {
        console.log();
        console.log(chalk.red(`  Duplication option : ${opt.name}`));
        console.log();
        command.usage();
        process.exit(-1);
      }
      checkSet.push(opt.name);
      if (opt.short) {
        if (checkSet.indexOf(opt.short) > -1) {
          console.log();
          console.log(chalk.red(`  Duplication option short : ${opt.name}(${opt.short})`));
          console.log();
          command.usage();
          process.exit(-1);
        }
        aliasOption[opt.name] = opt.short;
        checkSet.push(opt.short);
      }
    });

    let argv = minimist(args, {
      alias: aliasOption,
      boolean: true
    });

    if (argv.help === true) {
      command.usage();
      process.exit(0);
    }

    // set command args value
    checkSet = [];
    commandArgs.forEach((arg, key) => {
      if (checkSet.indexOf(arg.name) > -1) {
        console.log();
        console.log(chalk.red(`  Duplication argument : ${arg.name}`));
        console.log();
        command.usage();
        process.exit(-1);
      }
      arg['value'] = argv._[key] ? argv._[key] : '';
      if (arg.mode === 'required' && arg['value'] === '') {
        console.log();
        console.log(chalk.red(`  Required argument : ${arg.name}`));
        console.log();
        command.usage();
        process.exit(-1);
      }
      checkSet.push(arg.name);
    });

    commandOpts.forEach(opt => {
      opt['value'] = argv[opt.name] ? argv[opt.name] : '';
      if (opt.mode === 'required' && opt['value'] === '') {
        console.log();
        console.log(chalk.red(`  Required option : ${opt.name}`));
        console.log();
        command.usage();
        process.exit(-1);
      }
    });

    var cArgs = {};
    var cOpts = {};
    commandArgs.forEach(arg => {
      if (arg.value === '' && arg.default !== null) {
        arg.value = arg.default;
      }
      cArgs[arg.name] = arg.value;
    });

    commandOpts.forEach(opt => {
      if (opt.value === '' && opt.default !== null) {
        opt.value = opt.default;
      }
      cOpts[opt.name] = opt.value;
      if (opt.short) {
        cOpts[opt.short] = opt.value;
      }
    });

    command.args = cArgs;
    command.options = cOpts;
    command.argv = argv._;

    command.exec(cArgs, cOpts, argv._, this).catch((err) => {
      console.log();
      console.log(chalk.red('exec error :'));
      console.log(err.stack);
      console.log();
      process.exit(-1);
    });
  }

  showAmbiguous(commandName, matched) {
    console.log();

    const maxNameLength = Math.max(...matched.map((item) => item.config.name.length));
    const maxDescLength = Math.max(...matched.map((item) => item.config.desc.length));

    const maxLength = Math.max(maxNameLength + maxDescLength + 14, 34);

    console.log(color(fixed('', maxLength)));
    console.log(color(fixed(`    Command "${commandName}" is ambiguous.`, maxLength)));
    console.log(color(fixed(`    Did you mean one of these?    `, maxLength)));

    matched.forEach((item) => {
      const { name, desc } = item.config;
      console.log(color(`        ${fixed(name, maxNameLength)}  ${fixed(desc, maxDescLength)}`));
    });

    console.log(color(fixed('', maxLength)));
    console.log();
  }

  showHelp() {
    this.exec(this.commands['help']);
  }
}

module.exports = CommandsApplication;
