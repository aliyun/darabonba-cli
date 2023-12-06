'use strict';

const crypto = require('crypto');
const url = require('url');
const fs = require('fs');
const path = require('path');
const util = require('util');
const read = util.promisify(require('read'));

const { Config, default: RepoClient } = require('@darabonba/repo-client');

const { AES_KEY, AES_IV, DARA_CONFIG_FILE } = require('./constants');

const existsAsync = util.promisify(fs.exists);
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

function aesEncrypt(token) {
  var cipher = crypto.createCipheriv('aes-128-cbc', AES_KEY, AES_IV);
  var crypted = cipher.update(token, 'utf8', 'binary');
  crypted += cipher.final('binary');
  crypted = Buffer.from(crypted, 'binary').toString('base64');
  return crypted;
}

function aesDecrypt(crypted) {
  crypted = Buffer.from(crypted, 'base64').toString('binary');
  var decipher = crypto.createDecipheriv('aes-128-cbc', AES_KEY, AES_IV);
  var decoded = decipher.update(crypted, 'binary', 'utf8');
  decoded += decipher.final('utf8');
  return decoded;
}

async function getDaraConfig(tearcPath) {
  const exists = await existsAsync(tearcPath);
  if (!exists) {
    return {};
  }

  const content = await readFileAsync(tearcPath, 'utf8');
  return JSON.parse(content);
}

async function saveDaraConfig(config, tearcPath) {
  await writeFileAsync(tearcPath, JSON.stringify(config, null, 2));
}

async function newRepoClient(tearcPath = DARA_CONFIG_FILE) {
  let endpoint = 'darabonba.api.aliyun.com';
  let protocol = 'https';
  const daraConfig = await getDaraConfig(tearcPath);
  if (daraConfig.registry) {
    let parseRet = url.parse(daraConfig.registry);
    endpoint = parseRet.host || endpoint;
    protocol = parseRet.protocol ? parseRet.protocol.replace(':', '') : protocol;
  }

  let config = new Config({
    endpoint,
    protocol,
    auth: daraConfig.authToken || ''
  });
  return new RepoClient(config);
}

function delDir(dir) {
  let files = [];
  if (fs.existsSync(dir)) {
    files = fs.readdirSync(dir);
    files.forEach((file, index) => {
      let curPath = path.join(dir, file);
      if (fs.statSync(curPath).isDirectory()) {
        delDir(curPath); //递归删除文件夹
      } else {
        fs.unlinkSync(curPath); //删除文件
      }
    });
    fs.rmdirSync(dir);
  }
}

/**
 * title @string What to write to stdout before reading input.
 * value @string Default value if the user enters nothing.
 * opts @object Readline options
 * opts.retry @boolean Wait for user input util the input value is not empty .
 * opts.silent @boolean Don't echo the output as the user types it.
 * opts.timeout @number Number of ms to wait for user input before giving up.
 * opts.input @readable Stream to get input data from. (default process.stdin)
 * opts.output @writeable Stream to write prompts to. (default: process.stdout)
 */
async function readline(title, value, opts = {}) {
  let input = await read({ prompt: title, default: value || '', ...opts });
  if (opts.retry && !input) {
    return await readline(title, input, opts);
  }
  return input;
}

module.exports = {
  aesEncrypt,
  aesDecrypt,
  getDaraConfig,
  saveDaraConfig,
  delDir,
  newRepoClient,
  readline
};
