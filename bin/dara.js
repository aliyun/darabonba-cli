#!/usr/bin/env node

'use strict';

const CommandsApplication = require('../lib/app');
const groups = [
  {
    title: 'start a Darabonba project',
    commands: [
      require('../commands/init')
    ]
  },
  {
    title: 'working on the Darabonba project',
    commands: [
      require('../commands/check'),
      require('../commands/codegen'),
      require('../commands/build'),
      require('../commands/format'),
      require('../commands/config')
    ]
  },
  {
    title: 'working with Darabonba Repository(as maintainer)',
    commands: [
      require('../commands/login'),
      require('../commands/info'),
      require('../commands/pack'),
      require('../commands/publish'),
      require('../commands/unpublish'),
      require('../commands/install'),
      require('../commands/clean'),
      require('../commands/score')
    ]
  },
  {
    title: 'help commands',
    commands: [
      require('../commands/help')
    ]
  }
];

const app = new CommandsApplication(groups);
app.run(process.argv.slice(2));
