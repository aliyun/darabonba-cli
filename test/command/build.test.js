'use strict';

const command = require('../command');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const exists = promisify(fs.exists);
const assert = require('assert');

describe('build command should ok', function () {
  const daraFile = path.join(__dirname, '../fixture/build/main.dara');
  const daraFile_1 = path.join(__dirname, '../fixture/build/main_1.dara');
  const notExistFile = path.join(__dirname, '../fixture/build/notExist.dara');
  const outputFileActual = path.join(__dirname, '../output/build/output.json');
  const outputFileActual_1 = path.join(__dirname, '../output/build/output_1.json');

  it('build with no arguments should log usage', async function () {
    const { code, stdout } = await command.dara(['build']);
    const usageLog = await readFile(path.join(__dirname, '../fixture/build/usageLog'), 'utf8');
    assert.deepStrictEqual(code, 255);
    assert.deepStrictEqual(stdout, usageLog);
  });

  it('build ast with invalid filePath should be error', async function () {
    const { code, stdout } = await command.dara(['build', '-f']);
    assert.deepStrictEqual(code, 255);
    assert.ok(stdout.indexOf('Usage:') !== -1);
    assert.ok(stdout.indexOf('Required option : filename') !== -1);
  });

  it('build ast with not exist filePath should be error', async function () {
    const { code, stdout } = await command.dara(['build', '-f', notExistFile]);
    assert.deepStrictEqual(code, 255);
    assert.ok(stdout.indexOf('no such file or directory') !== -1);
  });

  it('build ast with no outputFilePath should log ast', async function () {
    const { code } = await command.dara(['build', '-f', daraFile]);
    assert.deepStrictEqual(code, 0);
  });

  it('build ast should be ok', async function () {
    const { code, stdout } = await command.dara(['build', '-f', daraFile, '-o', outputFileActual]);
    assert.deepStrictEqual(code, 0);
    assert.deepStrictEqual(stdout, '\n\u001b[32mBuilt successfully!\u001b[39m\n' +
      `\u001b[32mSave Path : ${outputFileActual}\u001b[39m\n\n`);
    assert.deepStrictEqual(await exists(outputFileActual), true);

    const {
      code: code_1,
      stdout: stdout_1
    } = await command.dara(['build', '-f', daraFile_1, '-o', outputFileActual_1]);
    assert.deepStrictEqual(code_1, 0);
    assert.deepStrictEqual(stdout_1, '\n\u001b[32mBuilt successfully!\u001b[39m\n' +
      `\u001b[32mSave Path : ${outputFileActual_1}\u001b[39m\n\n`);
    assert.deepStrictEqual(await exists(outputFileActual_1), true);
  });

});