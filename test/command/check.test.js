'use strict';

const command = require('../command');
const expect = require('expect.js');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
describe('check command should ok', function () {
  const daraFile = path.join(__dirname, '../fixture/check/main.dara');
  it('check a dara file with no argument should log usage', async function () {
    const { code, stdout } = await command.dara(['check']);
    const usageLog = await readFile(path.join(__dirname, '../fixture/check/usageLog'), 'utf8');
    expect(code).to.be(255);
    expect(stdout).to.be(usageLog);
  });

  it('check a dara file should be ok', async function () {
    const { code, stdout } = await command.dara(['check', daraFile]);
    expect(code).to.be(0);
    expect(stdout).to.be('\n\u001b[32mCheck success !\n\u001b[0m\n');
  });

});