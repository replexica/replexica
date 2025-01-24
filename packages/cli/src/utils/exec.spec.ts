import { describe, it, expect, vi } from "vitest";
import { execAsync, ExecAsyncOptions } from "./exec";

// describe('execAsync', () => {
//   // Helper function to create a delayed async function
//   const createDelayedFunction = (value: any, delay: number) => {
//     return async () => {
//       console.log(`[${Date.now()}] start`, value);
//       await new Promise(resolve => setTimeout(resolve, delay));
//       console.log(`[${Date.now()}] end`, value);
//       return value;
//     };
//   };

//   it('run', async () => {
//     await execAsync([
//       createDelayedFunction(1, 750),
//       createDelayedFunction(2, 750),
//       createDelayedFunction(3, 750),
//       createDelayedFunction(4, 750),
//     ], {
//       concurrency: 2,
//       delay: 250,
//     });
//   });
// });

describe("execAsync", () => {
  it("executes all functions and returns their results", async () => {
    const fns = [async () => 1, async () => 2, async () => 3];
    const options: ExecAsyncOptions = { concurrency: 1, delay: 0 };
    const results = await execAsync(fns, options);
    expect(results).toEqual([1, 2, 3]);
  });

  it("calls onProgress with correct values", async () => {
    const fns = [async () => 1, async () => 2, async () => 3];
    const onProgress = vi.fn();
    const options: ExecAsyncOptions = { concurrency: 1, delay: 0, onProgress };
    await execAsync(fns, options);
    expect(onProgress).toHaveBeenCalledTimes(4);
    expect(onProgress).toHaveBeenNthCalledWith(1, 0, 3);
    expect(onProgress).toHaveBeenNthCalledWith(2, 1, 3);
    expect(onProgress).toHaveBeenNthCalledWith(3, 2, 3);
    expect(onProgress).toHaveBeenNthCalledWith(4, 3, 3);
  });

  it("starts next function if previous finishes before delay", async () => {
    const delay = 100;
    const fns = [
      vi.fn().mockResolvedValue(1),
      vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(2), 50))),
      vi.fn().mockResolvedValue(3),
    ];
    const options: ExecAsyncOptions = { concurrency: 1, delay };
    const start = Date.now();
    await execAsync(fns, options);
    const end = Date.now();
    expect(end - start).toBeLessThan(delay * 3);
  });

  it("respects concurrency limit", async () => {
    const concurrency = 2;
    const delay = 100;
    let maxConcurrent = 0;
    let currentConcurrent = 0;

    const fns = Array(5)
      .fill(null)
      .map(() => async () => {
        currentConcurrent++;
        maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
        await new Promise((resolve) => setTimeout(resolve, delay));
        currentConcurrent--;
      });

    const options: ExecAsyncOptions = { concurrency, delay: 0 };
    await execAsync(fns, options);
    expect(maxConcurrent).toBe(concurrency);
  });

  it("handles empty array of functions", async () => {
    const options: ExecAsyncOptions = { concurrency: 1, delay: 0 };
    const results = await execAsync([], options);
    expect(results).toEqual([]);
  });

  it("handles single function", async () => {
    const fn = async () => 42;
    const options: ExecAsyncOptions = { concurrency: 1, delay: 0 };
    const results = await execAsync([fn], options);
    expect(results).toEqual([42]);
  });
});
