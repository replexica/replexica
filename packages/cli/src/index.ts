import { Command } from 'commander';
import Ora from 'ora';
import { setTimeout } from 'timers/promises';

import authCmd from './auth.js';
import translateCmd from './translate.js';

export default new Command()
  .name('replexica')
  .description('Replexica CLI')
  .helpOption('-h, --help', 'Show help')
  .addCommand(authCmd)
  .addCommand(translateCmd)
  .action(async (options) => {
    const spinner = Ora();
    spinner.start('Loading...');
    await setTimeout(2000);
    spinner.succeed('Welcome to Replexica CLI!');
  })
  .parse(process.argv);
