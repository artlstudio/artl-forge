#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';

const program = new Command();

program
  .name('artl')
  .description('Production-grade backend bootstrap CLI by Artl Studio')
  .version('0.0.1');

program.addCommand(initCommand);

program.parse();
