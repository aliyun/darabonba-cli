[English](/README.md) | 简体中文

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

## 安装

Darabonba CLI只能在 Node.js 环境下运行。建议使用 [NPM](https://www.npmjs.com/) 包管理工具安装。在终端输入以下命令进行安装:

```sh
$ npm install @darabonba/cli -g
```

## 使用示例

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

## 问题反馈

[提出问题](https://github.com/aliyun/darabonba-cli/issues/new/choose), 不符合指南的问题可能会立即关闭。

## 发布日志

发布详情会更新在 [release notes](/CHANGELOG.md) 文件中

## 许可证

[Apache-2.0](/LICENSE)
Copyright (c) 2009-present, Alibaba Cloud All rights reserved.