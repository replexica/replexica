import { Command } from "commander";
import Ora from 'ora';
import { getConfig } from "../utils/config";
import createBucketLoader from "../loaders";
import { ReplexicaEngine } from '@replexica/sdk';
import { getSettings } from "../utils/settings";

export default new Command()
  .command("dato")
  .description("Process DatoCMS data")
  .option("-p, --project-id <projectId>", "The DatoCMS project ID")
  .option("-i, --post-id <postId>", "The DatoCMS post ID")
  .helpOption("-h, --help", "Show help")
  .action(async (options) => {
    const spinner = Ora().start('Processing DatoCMS data');
    const config = getConfig(false);
    const settings = getSettings(undefined);

    if (!config) {
      spinner.fail('No configuration found');
      return process.exit(1);
    }

    const loader = createBucketLoader('dato', '');
    loader.setDefaultLocale('en');

    const result = await loader.pull('en');
    console.log(`[dato] Pulled en`, JSON.stringify(result, null, 2));

    const replexicaEngine = new ReplexicaEngine({
      apiKey: settings.auth.apiKey,
      apiUrl: settings.auth.apiUrl,
    });
    const localizedResult = await replexicaEngine.localizeObject(result, { sourceLocale: 'en', targetLocale: 'es' });
    console.log(`[dato] Localized en`, localizedResult);
    await loader.push('es', localizedResult);

    spinner.succeed('DatoCMS data processed');
  });
