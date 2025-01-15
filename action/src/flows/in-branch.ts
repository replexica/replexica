import { execSync } from "child_process";
import { gitConfig, IntegrationFlow } from "./_base.js";

export class InBranchFlow extends IntegrationFlow {
  async preRun() {
    this.ora.start("Configuring git");
    const canContinue = this.configureGit();
    this.ora.succeed("Git configured");

    return canContinue;
  }

  async run() {
    this.ora.start("Running Replexica");
    await this.runReplexica();
    this.ora.succeed("Done running Replexica");

    this.ora.start("Checking for changes");
    const hasChanges = this.checkCommitableChanges();
    this.ora.succeed(hasChanges ? "Changes detected" : "No changes detected");

    execSync(`git status`, { stdio: "inherit" });
    execSync(`git branch`, { stdio: "inherit" });

    if (hasChanges) {
      this.ora.start("Committing changes");
      execSync(`git add .`, { stdio: "inherit" });
      execSync(`git commit -m "${this.platformKit.config.commitMessage}"`, {
        stdio: "inherit",
      });
      this.ora.succeed("Changes committed");

      execSync(`git remote -v`, { stdio: "inherit" });

      this.ora.start("Pushing changes to remote");
      execSync(
        `git push origin ${this.platformKit.platformConfig.baseBranchName} --force`,
        { stdio: "inherit" },
      );
      this.ora.succeed("Changes pushed to remote");
    }

    return hasChanges;
  }

  protected checkCommitableChanges() {
    return (
      execSync('git status --porcelain || echo "has_changes"', {
        encoding: "utf8",
      }).length > 0
    );
  }

  private async runReplexica() {
    execSync(
      `npx replexica@latest i18n --api-key ${this.platformKit.config.replexicaApiKey}`,
      { stdio: "inherit" },
    );
  }

  private configureGit() {
    const currentAuthor = `${gitConfig.userName} <${gitConfig.userEmail}>`;
    const authorOfLastCommit = execSync(
      `git log -1 --pretty=format:'%an <%ae>'`,
    ).toString();
    if (authorOfLastCommit === currentAuthor) {
      this.ora.fail(`The action will not run on commits by ${currentAuthor}`);
      return false;
    }

    execSync(`git config --global user.name "${gitConfig.userName}"`);
    execSync(`git config --global user.email "${gitConfig.userEmail}"`);
    execSync(`git config --global safe.directory ${process.cwd()}`);
    this.platformKit?.gitConfig();

    return true;
  }
}
