'use strict';

const util = require('util');
const read = util.promisify(require('read'));

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
  readline
};
