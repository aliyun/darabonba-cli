'use strict';

const path = require('path');
const spawn = require('child_process').spawn;
const nodeBin = process.env.npm_node_execpath || process.env.NODE || process.execPath;

/**
 * test dara command
 * @param {String} cmd command
 * @param {Object} opts options
 * @returns
 */
exports.dara = async (cmd, opts = {}) => {
  const dara = path.join(__dirname, '../bin/dara.js');
  cmd = [dara].concat(cmd);
  opts.env = opts.env || process.env;
  opts.env['FORCE_COLOR'] = '1';
  const execNode = opts.execNode || nodeBin;
  const stdout = [];
  const stderr = [];
  const child = spawn(execNode, cmd, opts);
  if (child.stderr) {
    child.stderr.on('data', (chunk) => {
      stderr.push(chunk);
    });
  }

  if (child.stdout) {
    child.stdout.on('data', (chunk) => {
      stdout.push(chunk);
    });
  }

  return new Promise((resolve, reject) => {
    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      resolve({
        code,
        stdout: Buffer.concat(stdout).toString(),
        stderr: Buffer.concat(stderr).toString()
      });
    });
  });

};