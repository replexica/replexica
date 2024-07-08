import fs from 'fs';
import path from 'path';
import Z from 'zod';
import YAML from 'yaml';
import { MD5 } from 'object-hash';
import _ from 'lodash';

export type LockfilePayload = Z.infer<typeof LockfileSchema>;

export function createLockfileProcessor() {
  return {
    async load(): Promise<LockfilePayload> {
      const lockfilePath = _getLockfilePath();
    
      if (!fs.existsSync(lockfilePath)) {
        return LockfileSchema.parse({});
      }
    
      const content = fs.readFileSync(lockfilePath, 'utf-8');
      return LockfileSchema.parse(YAML.parse(content));
    },
    async save(payload: LockfilePayload): Promise<void> {
      const lockfilePath = _getLockfilePath();
    
      const content = YAML.stringify(LockfileSchema.parse(payload));
      
      fs.writeFileSync(lockfilePath, content);
    },
    async loadChecksums(bucketPath: string): Promise<Record<string, string>> {
      const lockfile = await this.load();
      const sectionKey = _getBucketSectionKey(bucketPath)
      return lockfile.checksums[sectionKey] || {};
    },
    async saveChecksums(bucketPath: string, checksums: Record<string, string>): Promise<void> {
      const lockfile = await this.load();
      const sectionKey = _getBucketSectionKey(bucketPath);
      lockfile.checksums[sectionKey] = checksums;
      await this.save(lockfile);
    },
    async createChecksums(values: Record<string, string>): Promise<Record<string, string>> {
      return _.mapValues(values, (value) => MD5(value));
    },
    async cleanupCheksums(existingBucketPath: string[]): Promise<void> {
      // leave only the checksums for the existing buckets
      const lockfile = await this.load();
      const existingSectionKeys = existingBucketPath.map(_getBucketSectionKey);
      lockfile.checksums = _.pick(lockfile.checksums, existingSectionKeys);
      await this.save(lockfile);
    },
  };

  function _getBucketSectionKey(bucketPath: string) {
    return MD5(bucketPath);
  }
}

const LockfileSchema = Z.object({
  version: Z.literal(1).default(1),
  checksums: Z.record(
    Z.string(), // bucket path
    Z.record( // checksums hashmap
      Z.string(), // key
      Z.string() // checksum of the key's value in the source locale
    ).default({}),
  ).default({}),
});

// Private

function _getLockfilePath() {
  return path.join(process.cwd(), 'i18n.lock');
}