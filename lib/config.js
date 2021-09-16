'use strict';

module.exports = {
  codegen: {
    // lang : [alias]
    ts: ['typescript'],
    cs: ['csharp', 'net'],
    java: [],
    'java-async': [],
    go: ['golang'],
    php: [],
    py: ['python'],
    py2: ['python2'],
    cpp: [],
  },
  generatorNameMap: {
    cs: 'csharp',
    ts: 'typescript',
    go: 'go',
    java: 'java',
    'java-async': 'java-async',
    php: 'php',
    py: 'python',
    py2: 'python2',
    cpp: 'cpp'
  }
};
