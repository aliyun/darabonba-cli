'use strict';

const command = require('../command');
const expect = require('expect.js');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
describe('config command should ok', function () {
  it('config with no arguments should log usage', async function () {
    const { code, stdout } = await command.dara(['config']);
    const usageLog = await readFile(path.join(__dirname, '../fixture/config/usageLog'), 'utf8');
    expect(code).to.be(255);
    expect(stdout).to.be(usageLog);
  });

  it('config list should ok', async function () {
    const { code } = await command.dara(['config', 'list']);
    expect(code).to.be(0);
  });

  it('config set should ok', async function () {
    const { code, stdout } = await command.dara(['config', 'set', 'key1', 'value1']);
    expect(code).to.be(0);
    expect(stdout).to.be(`\n\u001b[32mUpdate successfully!\n\u001b[0m\n`);
  });

  it('config get should ok', async function () {
    const { code, stdout } = await command.dara(['config', 'get', 'key1']);
    expect(code).to.be(0);
    expect(stdout).to.be('"value1"\n');
  });

  it('config delete should ok', async function () {
    const { code, stdout } = await command.dara(['config', 'delete', 'key1']);
    expect(code).to.be(0);
    expect(stdout).to.be('\n\u001b[32mDelete successfully!\n\u001b[0m\n');
    const { value } = await command.dara(['config', 'get', 'key1']);
    expect(value).to.be(undefined);
  });

});