'use strict';

const assert = require('assert');

const {
  aesEncrypt, aesDecrypt, getDaraConfig, saveDaraConfig
} = require('../../lib/util');
const path = require('path');

describe('util lib should ok', function () {
  it('aesEncrypt should be ok', () => {
    assert.deepStrictEqual(aesEncrypt('token'), 'TDQoYfPXFaUGuOowpRu80w==');
  });

  it('aesDecrypt should ok', () => {
    assert.deepStrictEqual(aesDecrypt('TDQoYfPXFaUGuOowpRu80w=='), 'token');
  });

  it('getDaraConfig with invalid rc path should ok', async () => {
    const dararcPath = path.join(__dirname, '.invalid_dararc');
    const config = await getDaraConfig(dararcPath);
    assert.deepStrictEqual(config, {});
  });

  it('getDaraConfig with valid rc path should ok', async () => {
    const dararcPath = path.join(__dirname, '../fixture/.dararc');
    const config = await getDaraConfig(dararcPath);
    assert.deepStrictEqual(config, {});
  });

  it('saveDaraConfig shoul ok', async () => {
    const dararcPath = path.join(__dirname, '../fixture/.dararc');
    await saveDaraConfig({}, dararcPath);
    const config = await getDaraConfig(dararcPath);
    assert.deepStrictEqual(config, {});
  });
});
