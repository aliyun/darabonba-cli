English | [简体中文](/README-CN.md)

# Darabonba CLI

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![codecov][cov-image]][cov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@darabonba/cli.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@darabonba/cli
[travis-image]: https://img.shields.io/travis/aliyun/darabonba-cli.svg?style=flat-square
[travis-url]: https://travis-ci.org/aliyun/darabonba-cli
[cov-image]: https://codecov.io/gh/aliyun/darabonba-cli/branch/master/graph/badge.svg
[cov-url]: https://codecov.io/gh/aliyun/darabonba-cli
[david-image]: https://img.shields.io/david/aliyun/darabonba-cli.svg?style=flat-square
[david-url]: https://david-dm.org/aliyun/darabonba-cli
[download-image]: https://img.shields.io/npm/dm/@darabonba/cli.svg?style=flat-square
[download-url]: https://npmjs.org/package/@darabonba/cli

## Installation

Darabonba CLI was designed to work in Node.js. The preferred way to install the Generator is to use the [NPM](https://www.npmjs.com/) package manager. Simply type the following into a terminal window:

```sh
$ npm install @darabonba/cli -g
```

## Usage

```sh
$ dara

The CLI for Darabonba 1.1.0

Usage:

    dara <command> [<args>]

Available commands:

start a Darabonba project
    init       initialization package information

working on the Darabonba project
    check      syntax check for dara file
    codegen    generate codes
    build      build ast file for dara file
    format     format the dara source file
    config     view or update configuration

working with Darabonba Repository(as maintainer)
    login        login to repository
    info         get the info of a dara scope or a dara pakcage
    pack         pack the project as a *.tgz file
    publish      publish the dara package to repository
    unpublish    unpublish the publish module
    install      install the dependencies from repository
    clean        clean the libraries folder
    score        get darabonba package score

help commands
    help       print the help information

```

## Issues

[Opening an Issue](https://github.com/aliyun/darabonba-cli/issues/new/choose), Issues not conforming to the guidelines may be closed immediately.

## Changelog

Detailed changes for each release are documented in the [release notes](/CHANGELOG.md).

## License

[Apache-2.0](/LICENSE)
Copyright (c) 2009-present, Alibaba Cloud All rights reserved.