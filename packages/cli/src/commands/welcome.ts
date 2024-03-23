import { Command } from '@oclif/core'

export class Welcome extends Command {
  static description = 'Replexica CLI';

  async run(): Promise<void> {
    this.log('Welcome to Replexica CLI');
  }
}