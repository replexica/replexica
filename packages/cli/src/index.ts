import dotenv from 'dotenv';
import { Command } from 'commander';

import i18nCmd from './i18n.js';
import authCmd from './auth.js';

dotenv.config();

export default new Command()
  .name('replexica')
  .description('Replexica CLI')
  .helpOption('-h, --help', 'Show help')
  .addCommand(i18nCmd)
  .addCommand(authCmd)
  .parse(process.argv);