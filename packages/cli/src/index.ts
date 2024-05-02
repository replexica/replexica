import { Command } from 'commander';

import i18nCmd from './i18n.js';
import authCmd from './auth.js';
import initCmd from './init.js';
import configCmd from './config.js';

export default new Command()
  .name('replexica')
  .description('Replexica CLI')
  .helpOption('-h, --help', 'Show help')
  .addCommand(i18nCmd)
  .addCommand(authCmd)
  .addCommand(initCmd)
  .addCommand(configCmd)
  .parse(process.argv);
