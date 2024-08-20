import { Command } from 'commander';
import Z from 'zod';
import Ora from 'ora';
import { createLockfileProcessor } from '../workers/lockfile';
import { bucketTypeSchema } from '@replexica/spec';
import { loadConfig } from '../workers/config';
import { createBucketLoader, expandPlaceholderedGlob } from '../workers/bucket/v2';

export default new Command()
  .command('lockfile')
  .description('Create a lockfile if it does not exist')
  .helpOption('-h, --help', 'Show help')
  .option('-f, --force', 'Force create a lockfile')
  .action(async (options) => {
    const flags = flagsSchema.parse(options);
    const ora = Ora().start('Creating lockfile');

    const lockfileProcessor = createLockfileProcessor();
    const lockfileExists = await lockfileProcessor.exists();
    if (lockfileExists && !flags.force) {
      ora.warn(`Lockfile won't be created because it already exists. Use --force to overwrite.`);
      return;
    } else {
      await lockfileProcessor.delete();
    }

    const i18nConfig = await loadConfig();

    const placeholderedPathsTuples: [Z.infer<typeof bucketTypeSchema>, string][] = [];
    for (const [bucketType, bucketTypeParams] of Object.entries(i18nConfig?.buckets || {})) {
      const includedPlaceholderedPaths = bucketTypeParams.include
        .map((placeholderedGlob) => expandPlaceholderedGlob(placeholderedGlob, i18nConfig!.locale.source))
        .flat();
      const excludedPlaceholderedPaths = bucketTypeParams.exclude
        ?.map((placeholderedGlob) => expandPlaceholderedGlob(placeholderedGlob, i18nConfig!.locale.source))
        .flat() || [];
      const finalPlaceholderedPaths = includedPlaceholderedPaths.filter((path) => !excludedPlaceholderedPaths.includes(path));
      for (const placeholderedPath of finalPlaceholderedPaths) {
        placeholderedPathsTuples.push([
          bucketType as Z.infer<typeof bucketTypeSchema>,
          placeholderedPath
        ]);
      }
    }

    for (const [bucketType, placeholderedPath] of placeholderedPathsTuples) {
      const sourcePayload = await createBucketLoader({
        bucketType,
        placeholderedPath,
        locale: i18nConfig!.locale.source,
      }).load();

      const currentChecksums = await lockfileProcessor.createChecksums(sourcePayload);
      await lockfileProcessor.saveChecksums(placeholderedPath, currentChecksums);
    }

    ora.succeed('Lockfile created');
  });

const flagsSchema = Z.object({
  force: Z.boolean().default(false),
});
