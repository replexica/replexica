import { execSync } from "child_process";
import { InBranchFlow } from "./in-branch.js";

export class PullRequestFlow extends InBranchFlow {
  private i18nBranchName?: string;

  async preRun() {
    await super.preRun?.();

    this.ora.start("Calculating automated branch name");
    this.i18nBranchName = this.calculatePrBranchName();
    this.ora.succeed(
      `Automated branch name calculated: ${this.i18nBranchName}`,
    );

    this.ora.start("Checking if branch exists");
    const branchExists = await this.checkBranchExistance(this.i18nBranchName);
    this.ora.succeed(branchExists ? "Branch exists" : "Branch does not exist");

    if (branchExists) {
      this.ora.start(`Checking out branch ${this.i18nBranchName}`);
      this.checkoutI18nBranch(this.i18nBranchName);
      this.ora.succeed(`Checked out branch ${this.i18nBranchName}`);

      this.ora.start(`Syncing with ${this.config.baseBranchName}`);
      this.syncI18nBranch();
      this.ora.succeed(`Checked out and synced branch ${this.i18nBranchName}`);
    } else {
      this.ora.start(`Creating branch ${this.i18nBranchName}`);
      this.createI18nBranch(this.i18nBranchName);
      this.ora.succeed(`Created branch ${this.i18nBranchName}`);
    }
  }

  async postRun() {
    if (!this.i18nBranchName) {
      throw new Error(
        "i18nBranchName is not set. Did you forget to call preRun?",
      );
    }

    this.ora.start("Checking if PR already exists");
    const pullRequestNumber = await this.ensureFreshPr(this.i18nBranchName);
    // await this.createLabelIfNotExists(pullRequestNumber, 'replexica/i18n', false);
    this.ora.succeed(
      `Pull request ready: https://github.com/${this.config.repositoryOwner}/${this.config.repositoryName}/pull/${pullRequestNumber}`,
    );
  }

  private calculatePrBranchName(): string {
    return `replexica/${this.config.baseBranchName}`;
  }

  private async checkBranchExistance(prBranchName: string) {
    const result = await this.octokit.rest.repos
      .getBranch({
        owner: this.config.repositoryOwner,
        repo: this.config.repositoryName,
        branch: prBranchName,
      })
      .then((r) => r.data)
      .catch((r) => (r.status === 404 ? false : Promise.reject(r)));

    return result;
  }

  private async ensureFreshPr(i18nBranchName: string) {
    // Check if PR exists
    this.ora.start(
      `Checking for existing PR with head ${i18nBranchName} and base ${this.config.baseBranchName}`,
    );
    const existingPr = await this.octokit.rest.pulls
      .list({
        owner: this.config.repositoryOwner,
        repo: this.config.repositoryName,
        head: `${this.config.repositoryOwner}:${i18nBranchName}`,
        base: this.config.baseBranchName,
        state: "open",
      })
      .then(({ data }) => data[0]);
    this.ora.succeed(existingPr ? "PR found" : "No PR found");

    if (existingPr) {
      // Close existing PR first
      this.ora.start(`Closing existing PR ${existingPr.number}`);
      await this.octokit.rest.pulls.update({
        owner: this.config.repositoryOwner,
        repo: this.config.repositoryName,
        pull_number: existingPr.number,
        state: "closed",
      });
      this.ora.succeed(`Closed existing PR ${existingPr.number}`);
    }

    // Create new PR
    this.ora.start(`Creating new PR`);
    const newPr = await this.octokit.rest.pulls.create({
      owner: this.config.repositoryOwner,
      repo: this.config.repositoryName,
      head: i18nBranchName,
      base: this.config.baseBranchName,
      title: this.config.pullRequestTitle,
      body: this.getPrBodyContent(),
    });
    this.ora.succeed(`Created new PR ${newPr.data.number}`);

    if (existingPr) {
      // Post comment about outdated PR
      this.ora.start(`Posting comment about outdated PR ${existingPr.number}`);
      await this.octokit.rest.issues.createComment({
        owner: this.config.repositoryOwner,
        repo: this.config.repositoryName,
        issue_number: existingPr.number,
        body: `This PR is now outdated. A new version has been created at #${newPr.data.number}`,
      });
      this.ora.succeed(`Posted comment about outdated PR ${existingPr.number}`);
    }

    return newPr.data.number;
  }

  private checkoutI18nBranch(i18nBranchName: string) {
    execSync(`git fetch origin ${i18nBranchName}`, { stdio: "inherit" });
    execSync(`git checkout ${i18nBranchName}`, { stdio: "inherit" });
  }

  private createI18nBranch(i18nBranchName: string) {
    execSync(`git fetch origin ${this.config.baseBranchName}`, {
      stdio: "inherit",
    });
    execSync(
      `git checkout -b ${i18nBranchName} origin/${this.config.baseBranchName}`,
      { stdio: "inherit" },
    );
  }

  private syncI18nBranch() {
    if (!this.i18nBranchName) {
      throw new Error("i18nBranchName is not set");
    }

    this.ora.start(
      `Fetching latest changes from ${this.config.baseBranchName}`,
    );
    execSync(`git fetch origin ${this.config.baseBranchName}`, {
      stdio: "inherit",
    });
    this.ora.succeed(
      `Fetched latest changes from ${this.config.baseBranchName}`,
    );

    try {
      this.ora.start("Attempting to rebase branch");
      execSync(`git rebase origin/${this.config.baseBranchName}`, {
        stdio: "inherit",
      });
      this.ora.succeed("Successfully rebased branch");
    } catch (error) {
      this.ora.warn("Rebase failed, falling back to alternative sync method");

      this.ora.start("Aborting failed rebase");
      execSync("git rebase --abort", { stdio: "inherit" });
      this.ora.succeed("Aborted failed rebase");

      this.ora.start(`Resetting to ${this.config.baseBranchName}`);
      execSync(`git reset --hard origin/${this.config.baseBranchName}`, {
        stdio: "inherit",
      });
      this.ora.succeed(`Reset to ${this.config.baseBranchName}`);

      this.ora.start("Restoring target files");
      const targetFiles = ["i18n.lock"];
      const targetFileNames = execSync(
        `npx replexica@latest show files --target ${this.config.baseBranchName}`,
        { encoding: "utf8" },
      )
        .split("\n")
        .filter(Boolean);
      targetFiles.push(...targetFileNames);
      execSync(`git fetch origin ${this.i18nBranchName}`, { stdio: "inherit" });
      for (const file of targetFiles) {
        try {
          // bring all files to the i18n branch's state
          execSync(`git checkout FETCH_HEAD -- ${file}`, { stdio: "inherit" });
        } catch (error) {
          // If file doesn't exist in FETCH_HEAD, that's okay - just skip it
          this.ora.warn(`Skipping non-existent file: ${file}`);
          continue;
        }
      }
      this.ora.succeed("Restored target files");
    }

    this.ora.start("Checking for changes to commit");
    const hasChanges = this.checkCommitableChanges();
    if (hasChanges) {
      execSync("git add .", { stdio: "inherit" });
      execSync(
        `git commit -m "chore: sync with ${this.config.baseBranchName}"`,
        { stdio: "inherit" },
      );
      this.ora.succeed("Committed additional changes");
    } else {
      this.ora.succeed("No changes to commit");
    }
  }

  private getPrBodyContent(): string {
    return `
Hey team,

[**Replexica AI**](https://replexica.com) here with fresh translations!

### In this update

- Added missing translations
- Performed brand voice, context and glossary checks
- Enhanced translations using Replexica Localization Engine

### Next Steps

- [ ] Review the changes
- [ ] Merge when ready
    `.trim();
  }
}
