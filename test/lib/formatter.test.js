'use strict';

const Darabonba = require('@darabonba/parser');
const assert = require('assert');

const Formatter = require('../../lib/formatter');

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

  it('issue #125 should ok', () => {
    const sourceCode = `static async function main(args: [ string ])throws : void {   var a = args[0]; } `;
    const ast = Darabonba.parse(sourceCode, '__filename');
    const formatter = new Formatter();
    formatter.visit(ast, 0);
    assert.deepStrictEqual(formatter.output, `static async function main(args: [ string ])throws : void {
  var a = args[0];
}

`);
  });
});
