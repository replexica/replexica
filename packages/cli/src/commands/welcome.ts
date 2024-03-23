import { Command } from '@oclif/core'

export default class Welcome extends Command {
  static description = 'Replexica CLI';

  async run(): Promise<void> {
    this.log('Welcome to Replexica CLI');
  }
}