'use strict';

const assert = require('assert');

const Command = require('../../lib/command');

class MyCommand extends Command {

}

describe('lib command', () => {
  it('command should ok', () => {
    const cmd = new MyCommand({
      name: 'test'
    });

    assert.throws(() => {
      cmd.exec();
    }, /Error: Please override exec : test command/);
  });
});
