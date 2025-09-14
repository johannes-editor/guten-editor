/**
 * Debounce function that delays the invocation of the passed function 
 * until after a specified wait time has passed since the last call.
 * 
 * @param func The function to debounce
 * @param wait The time (in milliseconds) to wait before invoking the function
 * @returns A debounced version of the provided function
 */
// deno-lint-ignore ban-types
export function debounce(func: Function, wait: number): Function {
    // deno-lint-ignore no-explicit-any
    let timeout: any;
    // deno-lint-ignore no-explicit-any
    return function(this: unknown, ...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}


export function waitFrames(n = 2): Promise<void> {
  return new Promise<void>(resolve => {
    const step = (i: number) =>
      requestAnimationFrame(() => (i > 1 ? step(i - 1) : resolve()));
    step(n);
  });
}