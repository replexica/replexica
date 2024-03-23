import { Command } from 'commander';
import Ora from 'ora';
import { setTimeout } from 'timers/promises';

import loginCmd from './login.js';

export default new Command()
  .name('replexica')
  .description('Replexica CLI')
  .helpOption('-h, --help', 'Show help')
  .addCommand(loginCmd)
  .action(async (options) => {
    const spinner = Ora();
    spinner.start('Loading...');
    await setTimeout(2000);
    spinner.succeed('Welcome to Replexica CLI!');
  })
  .parse(process.argv);
