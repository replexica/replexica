import Z from 'zod';
import pLimit from 'p-limit';

export type ExecAsyncOptions = Z.infer<typeof ExecAsyncSchema>;

/**
 * Executes functions in parallel with a limit on concurrency and delay between each function call.
 * 
 * The next function is called only after the delay has passed OR the previous function resolved, whichever is earlier (via race).
 * 
 * During the execution, it calls `onProgress` function with the number of functions completed and total count.
 * 
 * When all functions are executed, it returns an array of results.
 * @param fns Array of async functions
 * @param options Options
 */
export async function execAsync(
  fns: (() => Promise<any>)[],
  options: ExecAsyncOptions = ExecAsyncSchema.parse({}),
) {
  const limit = pLimit(options.concurrency);
  const limitedFns = fns.map(fn => () => limit(fn));

  const resultPromises: Promise<any>[] = [];

  let completedCount = 0;
  options.onProgress?.(completedCount, limitedFns.length);

  for (let i = 0; i < limitedFns.length; i++) {
    const fn = limitedFns[i];
    const resultPromise = fn().then((result) => {
      completedCount++;
      options.onProgress?.(completedCount, limitedFns.length);
      return result;
    });
    resultPromises.push(resultPromise);

    await Promise.race([
      resultPromise,
      delay(options.delay),
    ]);
  }

  const results = await Promise.all(resultPromises);
  return results;
}

export type ExecWithRetryOptions = Z.infer<typeof ExecWithRetrySchema>;

export async function execWithRetry(
  fn: () => Promise<any>,
  options: ExecWithRetryOptions = ExecWithRetrySchema.parse({}),
) {
  let lastError: any;

  for (let i = 0; i < options.attempts; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      await delay(options.delay);
    }
  }

  throw lastError;
}

// Helpers

const ExecAsyncSchema = Z.object({
  delay: Z.number().nonnegative().default(1000),
  concurrency: Z.number().positive().default(1),
  onProgress: Z.function(
    Z.tuple([
      Z.number().positive(), // completed count
      Z.number().positive(), // total count
    ]),
    Z.void(),
  ).optional(),
});

const ExecWithRetrySchema = Z.object({
  delay: Z.number().nonnegative().default(0),
  attempts: Z.number().positive().default(3),
});


function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}