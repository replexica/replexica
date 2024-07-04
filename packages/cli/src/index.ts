#!/usr/bin/env node

import { Command } from 'commander';

import i18nCmd from './i18n';
import authCmd from './auth';
import initCmd from './init';
import configCmd from './config';

export default new Command()
  .name('replexica')
  .description('Replexica CLI')
  .helpOption('-h, --help', 'Show help')
  .addCommand(i18nCmd)
  .addCommand(authCmd)
  .addCommand(initCmd)
  .addCommand(configCmd)
  .parse(process.argv);
