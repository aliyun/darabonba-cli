'use strict';

const assert = require('assert');

const chalk = require('chalk');

const command = require('../command');

describe('info command should ok', function () {

  it('info usage should be ok', async function () {
    const { code, stdout } = await command.dara(['info']);
    assert.deepStrictEqual(code, 255);
    assert.deepStrictEqual(stdout, `
  ${chalk.red('Required argument : module')}


${chalk.yellow('Usage:')}

    dara info <scope:moduleName>
    dara info <scope:moduleName:version>

`);
  });

  it('info -h should be ok', async function () {
    const { code, stdout } = await command.dara(['info', '-h']);
    assert.deepStrictEqual(code, 0);
    assert.deepStrictEqual(stdout, `
${chalk.yellow('Usage:')}

    dara info <scope:moduleName>
    dara info <scope:moduleName:version>

`);
  });

  it('info a dara package should be ok', async function () {
    const { code, stdout } = await command.dara(['info', 'darabonba:Util']);
    assert.deepStrictEqual(code, 0);
    assert.deepStrictEqual(stdout, `${chalk.green(`darabonba:Util@0.2.13`)} info:

main: ${chalk.yellow(`./main.tea`)}

dist:
.tarball: ${chalk.blue('https://darabonba-module-prod.oss-cn-zhangjiakou.aliyuncs.com/darabonba/Util-0.2.13.tar.gz')}
.shasum:  ${chalk.blue('1ef7e0b0b465a7e87fbeb9c777958967804e0182')}

maintainers:
- ${chalk.cyan('darabonba')}

`);
  });

  it('info invalid package should be ok', async function () {
    const { code, stdout } = await command.dara(['info', 'invalid:invalid']);
    assert.deepStrictEqual(code, 1);
    assert.deepStrictEqual(stdout, `${chalk.red(`the module invalid:invalid@latest isn't exists`)}\n`);
  });
});