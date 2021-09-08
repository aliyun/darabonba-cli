'use strict';

const assert = require('assert');

const command = require('../command');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

describe('check command should ok', function () {
  const daraFile = path.join(__dirname, '../fixture/check/main.dara');
  it('check a dara file with no argument should log usage', async function () {
    const { code, stdout } = await command.dara(['check']);
    const usageLog = await readFile(path.join(__dirname, '../fixture/check/usageLog'), 'utf8');
    assert.deepStrictEqual(code, 255);
    assert.deepStrictEqual(stdout, usageLog);
  });

  it('check a dara file should be ok', async function () {
    const { code, stdout } = await command.dara(['check', daraFile]);
    assert.deepStrictEqual(code, 0);
    assert.deepStrictEqual(stdout, '\n\u001b[32mCheck success!\u001b[39m\n\n');
  });

});