'use strict';

const assert = require('assert');
const path = require('path');

const {
  _upperFirst,
  getDarafile,
  supportedLang
} = require('../../lib/helper');

describe('helper lib should ok', function () {
  it('_upperFirst should be ok', async function () {
    assert.deepStrictEqual(_upperFirst('test'), 'Test');
    assert.deepStrictEqual(_upperFirst('test-string'), 'Test_string');
  });

  it('getDarafile should be ok', async function () {
    assert.deepStrictEqual(getDarafile(__dirname), path.join(__dirname, 'Darafile'));
    const TeaDirPath = path.join(__dirname,'../fixture/helper');
    assert.deepStrictEqual(getDarafile(TeaDirPath), path.join(TeaDirPath, 'Teafile'));
  });

  it('supportedLang should be ok', async function () {
    const codegen = {
      ts: ['typescript'],
      cs: ['csharp', 'net'],
      java: [],
      go: ['golang'],
      php: [],
      py: ['python']
    };
    assert.deepStrictEqual(supportedLang(codegen), 'ts, cs, java, go, php, py');
  });

});