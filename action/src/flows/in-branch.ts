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

    if (hasChanges) {
      this.ora.start("Committing changes");
      execSync(`git add .`, { stdio: "inherit" });
      execSync(`git commit -m "${this.platformKit.config.commitMessage}"`, {
        stdio: "inherit",
      });
      this.ora.succeed("Changes committed");

      this.ora.start("Pushing changes to remote");
      const currentBranch =
        this.i18nBranchName ?? this.platformKit.platformConfig.baseBranchName;
      execSync(`git push origin ${currentBranch} --force`, {
        stdio: "inherit",
      });
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
    execSync(`git config --global safe.directory ${process.cwd()}`);

    execSync(`git config user.name "${gitConfig.userName}"`);
    execSync(`git config user.email "${gitConfig.userEmail}"`);

    const currentAuthor = `${gitConfig.userName} <${gitConfig.userEmail}>`;
    const authorOfLastCommit = execSync(
      `git log -1 --pretty=format:'%an <%ae>'`,
    ).toString();
    if (authorOfLastCommit === currentAuthor) {
      this.ora.fail(`The action will not run on commits by ${currentAuthor}`);
      return false;
    }

    this.platformKit?.gitConfig();

    return true;
  }
}
