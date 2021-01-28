'use strict';

const command = require('../command');
const expect = require('expect.js');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const exists = promisify(fs.exists);

describe('build command should ok', function () {
  const daraFile = path.join(__dirname, '../fixture/build/main.dara');
  const daraFile_1 = path.join(__dirname, '../fixture/build/main_1.dara');
  const notExistFile = path.join(__dirname, '../fixture/build/notExist.dara');
  const outputFileActual = path.join(__dirname, '../output/build/output.json');
  const outputFileActual_1 = path.join(__dirname, '../output/build/output_1.json');

  it('build with no arguments should log usage', async function () {
    const { code, stdout } = await command.dara(['build']);
    const usageLog = await readFile(path.join(__dirname, '../fixture/build/usageLog'), 'utf8');
    expect(code).to.be(255);
    expect(stdout).to.be(usageLog);
  });

  it('build ast with invalid filePath should be error', async function () {
    const { code, stdout } = await command.dara(['build', '-f']);
    expect(code).to.be(255);
    expect(stdout).contain('The "path" argument must be of type string');
  });

  it('build ast with not exist filePath should be error', async function () {
    const { code, stdout } = await command.dara(['build', '-f', notExistFile]);
    expect(code).to.be(255);
    expect(stdout).contain('no such file or directory');
  });

  it('build ast with no outputFilePath should log ast', async function () {
    const { code } = await command.dara(['build', '-f', daraFile]);
    expect(code).to.be(0);
  });

  it('build ast should be ok', async function () {
    const { code, stdout } = await command.dara(['build', '-f', daraFile, '-o', outputFileActual]);
    expect(code).to.be(0);
    expect(stdout).to.be('\n\u001b[32mBuilt successfully !\n' +
      `Save Path : ${outputFileActual}\n\u001b[0m\n`);
    expect(await exists(outputFileActual)).to.be(true);

    const {
      code: code_1,
      stdout: stdout_1
    } = await command.dara(['build', '-f', daraFile_1, '-o', outputFileActual_1]);
    expect(code_1).to.be(0);
    expect(stdout_1).to.be('\n\u001b[32mBuilt successfully !\n' +
      `Save Path : ${outputFileActual_1}\n\u001b[0m\n`);
    expect(await exists(outputFileActual_1)).to.be(true);
  });

});