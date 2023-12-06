'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const util = require('util');
const exsitsAsync = util.promisify(fs.exists);

const chalk = require('chalk');

const command = require('../command');

describe('clean command should ok', function () {

  it('clean on non-darabonba package folder should be ok', async function () {
    const { code, stdout } = await command.dara(['clean']);
    assert.deepStrictEqual(code, 255);
    assert.deepStrictEqual(stdout, `
${chalk.red('Not a Darabonba package folder')}

`);
  });

  it('clean should be ok', async function () {
    const pkgDir = path.join(__dirname, '../fixture/clean/pkg');
    const { code: installCode } = await command.dara(['install'], {
      cwd: pkgDir
    });
    assert.deepStrictEqual(installCode, 0);
    assert.ok(await exsitsAsync(path.join(pkgDir, 'libraries')));
    const { code: cleanCode } = await command.dara(['clean'], {
      cwd: pkgDir
    });
    assert.deepStrictEqual(cleanCode, 0);
    assert.ok(!(await exsitsAsync(path.join(pkgDir, 'libraries'))));
  });
});
