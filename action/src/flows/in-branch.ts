import { execSync } from "child_process";
import { IntegrationFlow } from "./_base.js";

export class InBranchFlow extends IntegrationFlow {
  async preRun() {
    this.ora.start('Configuring git');
    this.configureGit();
    this.ora.succeed('Git configured');
  }

  async run() {
    this.ora.start('Running Replexica');
    await this.runReplexica();
    this.ora.succeed('Done running Replexica');

    this.ora.start('Checking for changes');
    const hasChanges = await this.checkCommitableChanges();
    this.ora.succeed(hasChanges ? 'Changes detected' : 'No changes detected');

    if (hasChanges) {
      this.ora.start('Committing changes');
      execSync(`git commit -m "${this.config.commitMessage}"`, { stdio: 'inherit' });
      this.ora.succeed('Changes committed');

      this.ora.start('Pushing changes to remote');
      execSync(`git push origin --all`, { stdio: 'inherit' });
      this.ora.succeed('Changes pushed to remote');
    }

    return hasChanges;
  }

  private async runReplexica() {
    execSync(`npx replexica@latest i18n --api-key ${this.config.replexicaApiKey}`, { stdio: 'inherit' });
    execSync(`git add .`, { stdio: 'inherit' });
  }

  private async checkCommitableChanges() {
    return execSync('git diff --staged --quiet || echo "has_changes"', { encoding: 'utf8' }).includes('has_changes');
  }

  
  private configureGit() {
    execSync('git config --global user.name "Replexica"');
    execSync('git config --global user.email "support@replexica.com"');
    execSync(`git config --global safe.directory ${process.cwd()}`);
  }
}
