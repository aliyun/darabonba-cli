'use strict';

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const minimatch = require('minimatch');
const tar = require('tar');

const printer = require('./printer');

function formatBytes(bytes, decimals) {
  if (!bytes) {
    return '0 Bytes';
  }

  var k = 1024,
    dm = decimals <= 0 ? 0 : decimals || 2,
    sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

exports.hash = (filePath) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath);
    const fsHash = crypto.createHash('sha256');
    var onData, onError, onEnd;

    function cleanup() {
      stream.removeListener('data', onData);
      stream.removeListener('error', onError);
      stream.removeListener('end', onEnd);
    }

    onData = function (d) {
      fsHash.update(d);
    };

    onError = function (err) {
      cleanup();
      reject(err);
    };

    onEnd = function () {
      cleanup();
      resolve(fsHash.digest('hex'));
    };

    stream.on('data', onData);
    stream.on('error', onError);
    stream.on('end', onEnd);
  });
};

function ignore(packFiles, filePath) {
  for (let i = 0; i < packFiles.length; i++) {
    const item = packFiles[i];
    if (minimatch(filePath, item)) {
      return false;
    }
  }

  return true;
}

exports.pack = async (pkg, rootDir) => {
  const { scope, name, version, files } = pkg;
  const packFiles = Array.from(new Set([
    '*.dara',
    '*.tea',
    'Teafile',
    'Darafile',
    'README.md',
    ...(files || [])
  ]));

  let tgzFilePath = `${scope}-${name}-${version}.tgz`;
  tgzFilePath = path.join(rootDir, tgzFilePath);
  printer.println('dara notice');
  printer.println(`dara notice ${scope}/${name}:${version}`);
  printer.info('dara notice === Tarball Contents ===');

  let sizeCount = 0;
  let fileCount = 0;
  let out = fs.createWriteStream(tgzFilePath);
  tar.c(
    {
      gzip: true,
      sync: true,
      filter: (filePath, stat) => {
        if (filePath !== './') {
          if (ignore(packFiles, filePath)) {
            return false;
          }
        }

        if (fs.statSync(filePath).isFile()) {
          printer.println(`  dara notice ${formatBytes(stat.size)}\t${filePath}`);
          sizeCount += stat.size;
          fileCount++;
        }
        return true;
      }
    },
    [ path.relative(rootDir, rootDir) ]
  ).pipe(out);
  out.close();
  printer.info('dara notice === Tarball Details ===');
  printer.println(`dara notice scope:\t\t${scope}`);
  printer.println(`dara notice name:\t\t${name}`);
  printer.println(`dara notice version:\t\t${version}`);
  printer.println(`dara notice filename:\t\t${path.basename(tgzFilePath)}`);
  printer.println(`dara notice package size:\t${formatBytes(out.writableLength)}`);
  printer.println(`dara notice unpackage size:\t${formatBytes(sizeCount)}`);
  const shasum = await exports.hash(tgzFilePath);
  printer.println(`dara notice shasum:\t\t${shasum}`);
  printer.println(`dara notice total files:\t\t${fileCount}`);
  printer.println('dara notice');
  printer.println(`${path.basename(tgzFilePath)}`);
};
