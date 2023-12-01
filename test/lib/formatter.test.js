'use strict';

const Darabonba = require('@darabonba/parser');
const assert = require('assert');
const rewire = require('rewire');

const Formatter = rewire('../../lib/formatter');

describe('formatter', function () {
  it('format for should ok', () => {
    const sourceCode = `static function test(args: [ string ]): void {for (var a : args) {}}`;
    const ast = Darabonba.parse(sourceCode, '__filename');
    const formatter = new Formatter();
    formatter.visit(ast, 0);
    assert.deepStrictEqual(formatter.output, `static function test(args: [ string ]): void {
  for (var a : args) {
  }
}

`);
  });
});
