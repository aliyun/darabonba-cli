'use strict';

const assert = require('assert');

const command = require('../command');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
describe('config command should ok', function () {
  it('config with no arguments should log usage', async function () {
    const { code, stdout } = await command.dara(['config']);
    const usageLog = await readFile(path.join(__dirname, '../fixture/config/usageLog'), 'utf8');
    assert.deepStrictEqual(code, 255);
    assert.deepStrictEqual(stdout, usageLog);
  });

  it('config list should ok', async function () {
    const { code } = await command.dara(['config', 'list']);
    assert.deepStrictEqual(code, 0);
  });

  it('config set should ok', async function () {
    const { code, stdout } = await command.dara(['config', 'set', 'key1', 'value1']);
    assert.deepStrictEqual(code, 0);
    assert.deepStrictEqual(stdout, `\n\u001b[32mUpdate successfully!\u001b[39m\n\n`);
  });

  it('config get should ok', async function () {
    const { code, stdout } = await command.dara(['config', 'get', 'key1']);
    assert.deepStrictEqual(code, 0);
    assert.deepStrictEqual(stdout, '"value1"\n');
  });

  it('config delete should ok', async function () {
    const { code, stdout } = await command.dara(['config', 'delete', 'key1']);
    assert.deepStrictEqual(code, 0);
    assert.deepStrictEqual(stdout, '\n\u001b[32mDelete successfully!\u001b[39m\n\n');
    const { value } = await command.dara(['config', 'get', 'key1']);
    assert.deepStrictEqual(value, undefined);
  });

});