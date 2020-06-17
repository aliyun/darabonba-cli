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
    title: 'help commands',
    commands: [
      require('../commands/help')
    ]
  }
];

const app = new CommandsApplication(groups);
app.run();
