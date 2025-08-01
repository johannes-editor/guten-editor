export function toKebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

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