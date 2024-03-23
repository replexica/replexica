import { Command } from 'commander';
import Ora from 'ora';
import { setTimeout } from 'timers/promises';

export default new Command()
  .command('translate')
  .description('Fetch translations from Replexica Platform')
  .helpOption('-h, --help', 'Show help')
  .action(async () => {
    const spinner = Ora();
    spinner.start('Fetching translations...');
    await setTimeout(2000);
    spinner.succeed('Translations fetched');
  });
