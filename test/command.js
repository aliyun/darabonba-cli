'use strict';

const path = require('path');
const spawn = require('child_process').spawn;
const nodeBin = process.env.npm_node_execpath || process.env.NODE || process.execPath;

exports.dara = async (cmd, opts = {}) => {
  const dara = path.join(__dirname, '../bin/dara.js');
  cmd = [dara].concat(cmd);
  opts.env = opts.env || process.env;
  let execNode = opts.execNode || nodeBin;
  let stdout = '';
  let stderr = '';
  let child = spawn(execNode, cmd, opts);
  if (child.stderr) {
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
  }

  if (child.stdout) {
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
  }

  return new Promise((resolve, reject) => {
    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      resolve({
        code,
        stdout,
        stderr
      });
    });
  });

};