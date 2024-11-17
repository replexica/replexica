import { Command } from "commander";
import Ora from 'ora';
import { getConfig } from "../utils/config";
import { createDatoApiLoader, createDatoLoader } from "../loaders/dato";
import { composeLoaders } from "../loaders/_utils";
import createFlatLoader from "../loaders/flat";
import { ILoader } from "../loaders/_types";

export default new Command()
  .command("dato")
  .description("Process DatoCMS data")
  .option("-p, --project-id <projectId>", "The DatoCMS project ID")
  .option("-i, --post-id <postId>", "The DatoCMS post ID")
  .helpOption("-h, --help", "Show help")
  .action(async (options) => {
    const spinner = Ora().start('Processing DatoCMS data');
    const config = getConfig(false);
    if (!config) {
      spinner.fail('No configuration found');
      return process.exit(1);
    }
    const projectId = options.projectId;
    if (!projectId) {
      spinner.fail('Project ID is required');
      return process.exit(1);
    }

    const postId = options.postId;  
    if (!postId) {
      spinner.fail('Post ID is required');
      return process.exit(1);
    }

    const loader: ILoader<void, Record<string, string>> = composeLoaders(
      createDatoApiLoader(projectId, postId),
      createDatoLoader(),
      createFlatLoader(),
    );
    loader.setDefaultLocale('en');

    const result = await loader.pull('en');
    const localizedResult = await doFakeLocalization(result);
    await loader.push('es', localizedResult);

    spinner.succeed('DatoCMS data processed');
  });
  
  async function doFakeLocalization(data: Record<string, string>) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, `ES:${value}`])
    );
  }
