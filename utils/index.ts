/**
 * @file utils
 */

/**
 * Wait for a certain amount of time
 * @param ms - time to wait in milliseconds
 * @returns a promise that resolves after the given time
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
