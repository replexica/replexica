import Z from 'zod';  
import { bucketTypeSchema } from '@replexica/spec';

export default function createBucketLoader(bucketType: Z.infer<typeof bucketTypeSchema>, bucketPathPattern: string) {
  switch (bucketType) {
    default: throw new Error(`Unsupported bucket type: ${bucketType}`);
  }
}
