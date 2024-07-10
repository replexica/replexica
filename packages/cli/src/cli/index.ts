#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import { Command } from 'commander';

import authCmd from './auth';
import initCmd from './init';
import configCmd from './show';
import i18nCmd from './i18n';

import packageJson from '../../package.json';

export default new Command()
  .name('replexica')
  .description('Replexica CLI')
  .helpOption('-h, --help', 'Show help')
  .version(`v${packageJson.version}`, '-v, --version', 'Show version')
  .addCommand(i18nCmd)
  .addCommand(authCmd)
  .addCommand(initCmd)
  .addCommand(configCmd)
  .parse(process.argv)
;
