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

  it('info a dara package should be ok', async function () {
    const { code, stdout } = await command.dara(['info', 'darabonba:Util']);
    assert.deepStrictEqual(code, 0);
    assert.deepStrictEqual(stdout, `${chalk.green(`darabonba:Util@0.2.11`)} info:

main: ${chalk.yellow(`./main.tea`)}

dist:
.tarball: ${chalk.blue('https://darabonba-module-prod.oss-cn-zhangjiakou.aliyuncs.com/darabonba/Util-0.2.11.tar.gz')}
.shasum:  ${chalk.blue('8fa8336f65e3107a2af613114389f34474a840ba')}

maintainers:
- ${chalk.cyan('darabonba')}

`);
  });
});