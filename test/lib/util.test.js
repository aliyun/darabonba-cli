'use strict';

const assert = require('assert');

const {
  aesEncrypt, aesDecrypt
} = require('../../lib/util');

describe('util lib should ok', function () {
  it('aesEncrypt should be ok', () => {
    assert.deepStrictEqual(aesEncrypt('token'), 'TDQoYfPXFaUGuOowpRu80w==');
  });

  it('aesDecrypt should ok', () => {
    assert.deepStrictEqual(aesDecrypt('TDQoYfPXFaUGuOowpRu80w=='), 'token');
  });

});
