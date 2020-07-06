'use strict';

const command = require('../command');
const expect = require('expect.js');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
describe('helper command should ok', function () {
  it('helper a dara file should be ok', async function () {
    const { code, stdout } = await command.dara(['help']);
    const expectContent = await readFile(path.join(__dirname, '../fixture/helper/helpLog'),'utf8');
    expect(code).to.be(0);
    expect(stdout).to.be(expectContent);
  });

});