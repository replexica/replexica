import { Command } from '@oclif/core'
import Ora from 'ora';
import { setTimeout } from 'timers/promises';

export class Login extends Command {
  static description = 'Replexica Login';

  async run(): Promise<void> {
    const spinner = Ora('Logging in...').start();
    await setTimeout(2000);
    spinner.succeed('Logged in');
  }
}