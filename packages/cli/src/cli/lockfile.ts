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
    const ora = Ora();

    ora.start('Creating lockfile');
    const result = await ensureLockfileExists(flags.force);
    if (result === 'exists') {
      ora.warn(`Lockfile won't be created because it already exists. Use --force to overwrite.`);
    } else {
      ora.succeed('Lockfile created');
    }
  });

const flagsSchema = Z.object({
  force: Z.boolean().default(false),
});

export type EnsureLockfileResult = 'created' | 'exists';
export async function ensureLockfileExists(force = false) {
  const lockfileProcessor = createLockfileProcessor();
  const lockfileExists = await lockfileProcessor.exists();
  if (lockfileExists && !force) {
    return 'exists';
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

  return 'created';
}