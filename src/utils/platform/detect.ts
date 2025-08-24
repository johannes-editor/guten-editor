/**
 * Detects Apple platforms (macOS/iOS).
 * Checks UA Client Hints first, then userAgent/vendor.
 * SSR-safe: returns false if `navigator` is unavailable.
 * @returns {boolean} True on macOS/iOS; otherwise false.
 */
export function isApplePlatform(): boolean {
    if (typeof navigator === "undefined") return false;

    // 1) Chromium: User-Agent Client Hints
    const uaData = (navigator as any).userAgentData;
    if (uaData && typeof uaData.platform === "string") {
        // Examples: "macOS", "iOS", "Windows", "Android", "Chrome OS", "Linux"
        return /macOS|iOS/i.test(uaData.platform);
    }

    // 2) Safari/Firefox/older: userAgent + vendor
    const ua = navigator.userAgent || "";
    if (/Mac|iPhone|iPad|iPod/i.test(ua)) return true;
    if (navigator.vendor && /Apple/i.test(navigator.vendor)) return true;

    return false;
}