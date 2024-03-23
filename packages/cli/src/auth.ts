import { Command } from 'commander';
import Ora from 'ora';
import { setTimeout } from 'timers/promises';

export default new Command()
  .command('auth')
  .description('Authenticate with Replexica Platform')
  .helpOption('-h, --help', 'Show help')
  .argument('<email>', 'Email address')
  .action(async () => {
    const spinner = Ora();
    spinner.start('Logging in...');
    await setTimeout(2000);
    spinner.succeed('Logged in');
  });
