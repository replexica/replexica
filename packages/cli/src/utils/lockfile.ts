import fs from "fs";
import path from "path";
import Z from "zod";
import YAML from "yaml";
import { MD5 } from "object-hash";
import _ from "lodash";

export function createLockfileHelper() {
  return {
    isLockfileExists: () => {
      const lockfilePath = _getLockfilePath();
      return fs.existsSync(lockfilePath);
    },
    registerSourceData: (
      pathPattern: string,
      sourceData: Record<string, any>,
    ) => {
      const lockfile = _loadLockfile();

      const sectionKey = MD5(pathPattern);
      const sectionChecksums = _.mapValues(sourceData, (value) => MD5(value));

      lockfile.checksums[sectionKey] = sectionChecksums;

      _saveLockfile(lockfile);
    },
    extractUpdatedData: (
      pathPattern: string,
      sourceData: Record<string, any>,
    ) => {
      const lockfile = _loadLockfile();

      const sectionKey = MD5(pathPattern);
      const currentChecksums = _.mapValues(sourceData, (value) => MD5(value));

      const savedChecksums = lockfile.checksums[sectionKey] || {};
      const updatedData = _.pickBy(
        sourceData,
        (value, key) => savedChecksums[key] !== currentChecksums[key],
      );

      return updatedData;
    },
  };

  function _loadLockfile() {
    const lockfilePath = _getLockfilePath();
    if (!fs.existsSync(lockfilePath)) {
      return LockfileSchema.parse({});
    }
    const content = fs.readFileSync(lockfilePath, "utf-8");
    const result = LockfileSchema.parse(YAML.parse(content));
    return result;
  }

  function _saveLockfile(lockfile: Z.infer<typeof LockfileSchema>) {
    const lockfilePath = _getLockfilePath();
    const content = YAML.stringify(lockfile);
    fs.writeFileSync(lockfilePath, content);
  }

  function _getLockfilePath() {
    return path.join(process.cwd(), "i18n.lock");
  }
}

const LockfileSchema = Z.object({
  version: Z.literal(1).default(1),
  checksums: Z.record(
    Z.string(), // localizable files' keys
    Z.record(
      // checksums hashmap
      Z.string(), // key
      Z.string(), // checksum of the key's value in the source locale
    ).default({}),
  ).default({}),
});
