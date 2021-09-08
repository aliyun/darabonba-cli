'use strict';

const assert = require('assert');

const command = require('../command');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

describe('format command should ok', function () {

  it('format a dara file with no argument should log usage', async function () {
    const { code, stdout } = await command.dara(['format']);
    const usageLog = await readFile(path.join(__dirname, '../fixture/format/usageLog'), 'utf8');
    assert.deepStrictEqual(code, 255);
    assert.deepStrictEqual(stdout, usageLog);
  });

  it('format a dara file should be ok', async function () {
    const daraFile = path.join(__dirname, '../fixture/format/main.dara');
    const expectFile = path.join(__dirname, '../fixture/format/expect.dara');
    const { code } = await command.dara(['format', daraFile]);
    assert.deepStrictEqual(code, 0);
    const expectContent = await readFile(expectFile);
    const actualContent = await readFile(daraFile);
    assert.deepStrictEqual(actualContent.toString(), expectContent.toString());
  });

  it('format a complex file should be ok', async function () {
    const daraFile = path.join(__dirname, '../fixture/format/complex.dara');
    const { code } = await command.dara(['format', daraFile]);
    assert.deepStrictEqual(code, 0);
  });

  it('format a error dara file should be error', async function () {
    const daraFile = path.join(__dirname, '../fixture/format/error.dara');
    const { code, stdout } = await command.dara(['format', daraFile]);
    assert.deepStrictEqual(code, 255);
    // eslint-disable-next-line max-len
    assert.ok(stdout.indexOf('SyntaxError: Unexpected token: Word: `helloMap`. Expect ID function, but Word: `helloMap`') !== -1);
  });
});
