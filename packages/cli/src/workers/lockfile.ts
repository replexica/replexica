import fs from 'fs';
import path from 'path';
import Z from 'zod';
import YAML from 'yaml';

export type LockfilePayload = Z.infer<typeof LockfileSchema>;

export async function loadLockfile(): Promise<LockfilePayload> {
  const lockfilePath = _getLockfilePath();

  if (!fs.existsSync(lockfilePath)) {
    return LockfileSchema.parse({});
  }

  const content = fs.readFileSync(lockfilePath, 'utf-8');
  return LockfileSchema.parse(YAML.parse(content));
}

export async function saveLockfile(payload: LockfilePayload): Promise<void> {
  const lockfilePath = _getLockfilePath();

  const content = YAML.stringify(LockfileSchema.parse(payload));
  
  fs.writeFileSync(lockfilePath, content);
}

export async function updateLockfile(updater: (payload: LockfilePayload) => LockfilePayload): Promise<void> {
  const lockfile = await loadLockfile();
  const updatedLockfile = updater(lockfile);
  await saveLockfile(updatedLockfile);
}

const LockfileSchema = Z.object({
  version: Z.literal(1).default(1),
  checksums: Z.record(
    Z.string(),
    Z.string()
  ).default({}),
});

// Private

function _getLockfilePath() {
  return path.join(process.cwd(), 'i18n.lock');
}