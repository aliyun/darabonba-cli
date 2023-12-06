'use strict';

const assert = require('assert');

const command = require('../command');

describe('help command should ok', function () {
  it('help a dara file should be ok', async function () {
    const { code, stdout } = await command.dara(['help']);
    assert.deepStrictEqual(code, 0);
    const version = require('../../package.json').version;
    assert.deepStrictEqual(stdout, `
The CLI for Darabonba \u001b[32m${version}\u001b[39m

[33mUsage:[39m

    dara <command> [<args>]

[33mAvailable commands:[39m

start a Darabonba project
    [32minit     [39m    initialization package information

working on the Darabonba project
    [32mcheck    [39m    syntax check for dara file
    [32mcodegen  [39m    generate codes
    [32mbuild    [39m    build ast file for dara file
    [32mformat   [39m    format the dara source file
    [32mconfig   [39m    view or update configuration

working with Darabonba Repository(as maintainer)
    [32mlogin    [39m    login to repository
    [32minfo     [39m    get the info of a dara scope or a dara pakcage
    [32mpack     [39m    pack the project as a *.tgz file
    [32mpublish  [39m    publish the dara package to repository
    [32munpublish[39m    unpublish the publish module
    [32minstall  [39m    install the dependencies from repository
    [32mclean    [39m    clean the libraries folder
    [32mscore    [39m    get darabonba package score

help commands
    [32mhelp     [39m    print the help information

`);
  });

});