'use strict';

const expect = require('expect.js');
const path = require('path');
const rewire = require('rewire');
const helper = rewire('../../lib/helper');

describe('helper lib should ok', function () {
  it('_upperFirst should be ok', async function () {
    const _upperFirst = helper.__get__('_upperFirst');
    expect(_upperFirst('test')).to.be('Test');
    expect(_upperFirst('test-string')).to.be('Test_string');
  });

  it('getDarafile should be ok', async function () {
    const getDarafile = helper.__get__('getDarafile');
    expect(getDarafile(__dirname)).to.be(path.join(__dirname, 'Darafile'));
    const TeaDirPath = path.join(__dirname,'../fixture/helper');
    expect(getDarafile(TeaDirPath)).to.be(path.join(TeaDirPath, 'Teafile'));
  });

  it('supportedLang should be ok', async function () {
    const supportedLang = helper.__get__('supportedLang');
    const codegen = {
      ts: ['typescript'],
      cs: ['csharp', 'net'],
      java: [],
      go: ['golang'],
      php: [],
      py: ['python']
    };
    expect(supportedLang(codegen)).to.be('ts, cs, java, go, php, py');
  });

});