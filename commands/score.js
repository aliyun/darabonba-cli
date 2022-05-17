'use strict';

const path = require('path');
const fs = require('fs');

const chalk = require('chalk');

const Command = require('../lib/command');
const AstUtil = require('../lib/ast_util');
const {
  PKG_FILE,
  DARA_CONFIG_FILE
} = require('../lib/constants');

class ScoreCommand extends Command {
  constructor() {
    super({
      name: 'score',
      alias: [],
      desc: 'get darabonba package score',
      args: [],
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

  async exec() {
    this.getScore().catch((err) => {
      console.log();
      console.log(chalk.red(err.stack));
      console.log();
      process.exit(-1);
    });
  }

  async getScore() {
    const pkgDir = process.cwd();
    const pkgFilePath = path.join(pkgDir, PKG_FILE);
    if (!fs.existsSync(pkgFilePath)) {
      console.log();
      console.log(chalk.red(`This folder is not a Darabonba package project(No Darafile exist)`));
      console.log();
      process.exit(-1);
    }
    const moduleAst = new AstUtil(pkgDir);
    const { scope, name, version } = moduleAst.getPkg();
    if (!scope || !name || !version) {
      console.log();
      console.log(chalk.red('The contents of the Darafile are incomplete.'));
      console.log(chalk.red('You can use `dara init` to initialize the file contents.'));
      console.log();
      this.process.exit(-1);
    }
    const scoreResult = moduleAst.getScore();
    console.log();
    this.printScore('Total score:\t\t\t', scoreResult.total);
    this.printScore(' The readme score:\t\t', scoreResult.readme);
    this.printScore(' The release score:\t\t', scoreResult.release);
    this.printScore(' The annotation score:\t\t', scoreResult.annotation);
    const report = moduleAst.getScoreReport();
    if (report.release && report.release.length) {
      process.stdout.write(`\n\n Unreleased Languages: ${report.release.join(', ')}`);
    }
    let apiPrint = this.formatScoreReportTable(report.api, ['incomplete_APIs', 'missing_items']);
    if (apiPrint) {
      process.stdout.write('\n\n APIs Annotation Detail\n');
      process.stdout.write(apiPrint);
    }
    let functionPrint = this.formatScoreReportTable(report.function, ['incomplete_functions', 'missing_items']);
    if (functionPrint) {
      process.stdout.write('\n\n Functions Annotation Detail\n');
      process.stdout.write(functionPrint);
    }
    let modelPrint = this.formatScoreReportTable(report.model, ['incomplete_models', 'missing_items']);
    if (modelPrint) {
      process.stdout.write('\n\n Models Annotation Detail\n');
      process.stdout.write(modelPrint);
    }
  }

  printScore(title, score) {
    if (score > 80) {
      process.stdout.write(chalk.green(`${title}${score}`));
    } else if (score > 60) {
      process.stdout.write(chalk.yellow(`${title}${score}`));
    } else {
      process.stdout.write(chalk.red(`${title}${score}`));
    }
  }

  formatScoreReportTable(data, tableTitles) {
    let columnMax = [tableTitles[0].length, tableTitles[1].length];
    let resultArr = [];
    Object.keys(data).map(item => {
      if (data[item] && data[item].length) {
        let itemValue = data[item].join(', ');
        columnMax[0] = item.length > columnMax[0] ? item.length : columnMax[0];
        columnMax[1] = itemValue.length > columnMax[1] ? itemValue.length : columnMax[1];
        resultArr.push([item, itemValue]);
      }
    });
    if (!resultArr.length) {
      return;
    }
    let result = '';
    this.formatColumnMax(columnMax);
    result += '┌' + this.getRepeatStr('─', columnMax[0] + 2) + '┬' + this.getRepeatStr('─', columnMax[1] + 2) + '┐\n';
    result += this.getLineStr(tableTitles, columnMax, ' ');
    result += '├' + this.getRepeatStr('─', columnMax[0] + 2) + '┼' + this.getRepeatStr('─', columnMax[1] + 2) + '┤\n';
    resultArr.forEach(item => {
      result += this.getLineStr(item, columnMax, ' ');
    });
    result += '└' + this.getRepeatStr('─', columnMax[0] + 2) + '┴' + this.getRepeatStr('─', columnMax[1] + 2) + '┘\n';
    return result;
  }

  getLineStr(columns, columnMax, defaultStr) {
    let result = '│ ';
    result += columns[0] + this.getRepeatStr(defaultStr, columnMax[0] - columns[0].length);
    result += ' │ ';
    result += columns[1] + this.getRepeatStr(defaultStr, columnMax[1] - columns[1].length);
    result += ' │\n';
    return result;
  }

  getRepeatStr(str, num) {
    let result = '';
    for (let i = 0; i < num; i++) {
      result += str;
    }
    return result;
  }

  formatColumnMax(columnMax) {
    let defaultCols = 80;
    let total = columnMax[0] + columnMax[1];
    if (total > defaultCols) {
      return;
    }
    let col_0 = (defaultCols - total) % 2 ? (defaultCols - total) / 2 : (defaultCols - total + 1) / 2;
    let col_1 = (defaultCols - total) % 2 ? (defaultCols - total) / 2 : (defaultCols - total - 1) / 2;
    columnMax[0] += col_0;
    columnMax[1] += col_1;
  }

  usage() {
    console.log();
    console.log(chalk.yellow('Usage:'));
    console.log();
    console.log('    dara score');
    console.log();
  }
}

module.exports = new ScoreCommand();
