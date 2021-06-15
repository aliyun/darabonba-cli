'use strict';

exports.fixed = function (content, length = 10, fillPosition = 'l', fill = ' ') {
  if (content.length < length) {
    var leftFill = '';
    var rightFill = '';
    if (fillPosition.indexOf('r') === 0) {
      leftFill = fill.repeat(length - content.length);
    } else if (fillPosition.indexOf('c') === 0) {
      var left = Math.floor((length - content.length) / 2);
      leftFill = fill.repeat(left);
      rightFill = fill.repeat(length - content.length - left);
    } else {
      rightFill = fill.repeat(length - content.length);
    }
    fill = fill.repeat(length - content.length);
    content = leftFill + content + rightFill;
  }
  return content;
};