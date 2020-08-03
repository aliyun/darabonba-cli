'use strict';

const crypto = require('crypto');
const url = require('url');
const fs = require('fs');
const path = require('path');
const util = require('util');
const urllib = require('urllib');
const read = util.promisify(require('read'));


const { Config, default: RepoClient } = require('@darabonba/repo-client');

const {
  AES_KEY,
  AES_IV,
  DARA_CONFIG_FILE
} = require('./constants');

urllib.request[util.promisify.custom] = (...args) => {
  return new Promise((resolve, reject) => {
    urllib.request(...args, (err, data, res) => {
      if (err !== null) {
        reject(err);
      } else {
        resolve({ data, res });
      }
    });
  });
};

const request = util.promisify(urllib.request);
let client;

function errorHandler(resp) {
  if (!resp) {
    return;
  }
  console.error(resp.statusCode);
  if (resp.data && resp.data instanceof Buffer) {
    resp.body = JSON.parse(resp.data.toString('utf8'));
  }

  let errorCode = resp.body ? resp.body.error : 'BAD REQUEST';
  let errormsg = resp.body ? resp.body.reason : 'unkonwn reason.';
  console.error(errorCode);
  console.error(errormsg);
  process.exit(-1);
}

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

function getToken() {
  if (!fs.existsSync(DARA_CONFIG_FILE)) {
    return '';
  }
  let config = JSON.parse(fs.readFileSync(DARA_CONFIG_FILE, { encoding: 'utf8' }));
  return config.authToken || '';
  
}

function requestHandler(tearcPath = DARA_CONFIG_FILE) {
  if (client) {
    return client;
  }

  let endpoint = 'darabonba.api.aliyun.com';
  let protocol = 'https';
  if (fs.existsSync(tearcPath)) {
    let obj = JSON.parse(fs.readFileSync(tearcPath, 'utf8'));
    if (obj.registry) {
      let parseRet = url.parse(obj.registry);
      endpoint = parseRet.host || endpoint;
      protocol = parseRet.protocol ? parseRet.protocol.replace(':', '') : protocol;
    }
  }

  let config = new Config({
    endpoint,
    protocol,
    auth: getToken()
  });
  client = new RepoClient(config);
  return client;
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
  getToken,
  delDir,
  errorHandler,
  request,
  requestHandler,
  readline
};
