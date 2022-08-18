'use strict';

const assert = require('assert');

const command = require('../command');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const exists = promisify(fs.exists);

const generateLanguageMap = {
  ts: ['src/client.ts', 'package.json', 'tsconfig.json'],
  python: ['darabonba_sdk/client.py'],
  python2: ['darabonba_sdk/client.py'],
  java: ['src/main/java/com/darabonba/test/Client.java'],
  'java-async': ['src/main/java/com/darabonba/test/DefaultAsyncClient.java'],
  php: ['Client.php'],
  golang: ['client/client.go', 'go.mod'],
  csharp: ['core/client.csproj', 'core/Client.cs'],
  cpp: ['src/test.cpp', 'include/darabonba/test.hpp'],
  swift: ['Sources/Darabonba_Test/Client.swift']
};

describe('codegen command should ok', function () {
  const daraPath = path.join(__dirname, '../fixture/codegen/template');
  const interfaceDaraPath = path.join(__dirname, '../fixture/codegen/interface');
  const outputPath = path.join(__dirname, '../output/codegen/');

  it(`codegen with no language should be error`, async function () {
    const { code, stdout } = await command.dara(['codegen']);
    assert.deepStrictEqual(code, 255);
    assert.ok(stdout.indexOf('Required argument : lang') !== -1);
  });

  it(`codegen with no outputDir should be error`, async function () {
    const { code, stdout } = await command.dara(['codegen', 'ts']);
    assert.deepStrictEqual(code, 255);
    assert.ok(stdout.indexOf('Required argument : outputDir') !== -1);
  });

  it(`codegen with interface daraFile should be error`, async function () {
    const { code, stdout } = await command.dara(['codegen', 'ts', path.join(outputPath, 'ts'), interfaceDaraPath]);
    assert.deepStrictEqual(code, 255);
    assert.ok(stdout.indexOf('The package is interface mode, the SDK can not be generated') !== -1);
  });

  it(`codegen with not supported language should be error`, async function () {
    const outputLanguagePath = path.join(outputPath, 'invalid_language');
    const { code, stdout } = await command.dara(['codegen', 'invalid_language', outputLanguagePath, daraPath]);
    assert.deepStrictEqual(code, 255);
    assert.ok(stdout.indexOf(`The language 'invalid_language' not supported.`) !== -1);
  });

  for (const language in generateLanguageMap) {
    if (generateLanguageMap[language]) {
      it(`codegen ${language} sdk should be ok with valid dara file`, async function () {
        const { code } = await command.dara(['codegen', language, path.join(outputPath, language), daraPath]);
        assert.deepStrictEqual(code, 0);
        const files = generateLanguageMap[language];
        for (const file of files) {
          const exist = await exists(path.join(outputPath, language, file));
          assert.deepStrictEqual(exist, true);
        }
      });
    }
  }
});