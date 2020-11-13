'use strict';

const command = require('../command');
const expect = require('expect.js');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);

const generateLanguageMap = {
  ts: ['src/client.ts', 'package.json', 'tsconfig.json'],
  python: ['darabonba_sdk/client.py'],
  java: ['src/main/java/com/darabonba/test/Client.java'],
  php: ['Client.php'],
  golang: ['client/client.go', 'go.mod'],
  csharp: ['core/client.csproj', 'core/Client.cs'],
  cpp: ['src/test.cpp', 'include/darabonba/test.hpp']
};

describe('codegen command should ok', function () {
  const daraPath = path.join(__dirname, '../fixture/codegen/template');
  const interfaceDaraPath = path.join(__dirname, '../fixture/codegen/interface');
  const outputPath = path.join(__dirname, '../output/codegen/');

  it(`codegen with no language should be error`, async function () {
    const { code, stdout } = await command.dara(['codegen']);
    expect(code).to.be(255);
    expect(stdout).contain('Required argument : lang');
  });

  it(`codegen with no outputDir should be error`, async function () {
    const { code, stdout } = await command.dara(['codegen', 'ts']);
    expect(code).to.be(255);
    expect(stdout).contain('Required argument : outputDir');
  });

  it(`codegen with interface daraFile should be error`, async function () {
    const { code, stdout } = await command.dara(['codegen', 'ts', path.join(outputPath, 'ts'), interfaceDaraPath]);
    expect(code).to.be(255);
    expect(stdout).contain('The package is interface mode, the SDK can not be generated');
  });

  it(`codegen with not supported language should be error`, async function () {
    const outputLanguagePath = path.join(outputPath, 'invalid_language');
    const { code, stdout } = await command.dara(['codegen', 'invalid_language', outputLanguagePath, daraPath]);
    expect(code).to.be(255);
    expect(stdout).contain(`The language 'invalid_language' not supported.`);
  });

  for (const language in generateLanguageMap) {
    if (generateLanguageMap[language]) {
      it(`codegen ${language} sdk should be ok with valid dara file`, async function () {
        const { code } = await command.dara(['codegen', language, path.join(outputPath, language), daraPath]);
        expect(code).to.be(0);
        const files = generateLanguageMap[language];
        for (const file of files) {
          const expectFile = await readFile(path.join(daraPath, language, file), 'utf8');
          const actualFile = await readFile(path.join(outputPath, language, file), 'utf8');
          expect(actualFile).to.be(expectFile);
        }
      });
    }
  }
});