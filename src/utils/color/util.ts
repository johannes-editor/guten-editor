export function clearInlineHighlightInSelection() {
    const sel = globalThis.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;

    const intersects = (r: Range, node: Node) => {
        const nr = document.createRange();
        try { nr.selectNode(node); } catch { nr.selectNodeContents(node); }
        return r.compareBoundaryPoints(Range.END_TO_START, nr) < 0 &&
            r.compareBoundaryPoints(Range.START_TO_END, nr) > 0;
    };

    const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_ELEMENT);
    const toProcess: HTMLElement[] = [];
    for (let n = walker.currentNode as HTMLElement | null; n; n = walker.nextNode() as HTMLElement | null) {
        if (n && intersects(range, n)) toProcess.push(n);
    }

    for (const el of toProcess) {
        if (el.style?.backgroundColor) el.style.removeProperty("background-color");
        if (el.style?.background) el.style.removeProperty("background");
    }
}


export function getSelectionAnchorElement(): HTMLElement | null {
    const sel = globalThis.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    return (node.nodeType === Node.ELEMENT_NODE
        ? (node as HTMLElement)
        : (node.parentElement)) ?? null;
}

export function hslToHex(h: number, s: number, l: number): string {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
    else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
    else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
    else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
    else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
    else[r, g, b] = [c, 0, x];
    const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function normalizeCssColorToHex(input: string): string {
    const lower = input.trim().toLowerCase();
    const hex = lower.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[0];
    if (hex) {
        if (hex.length === 4) {
            return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
        }
        return hex;
    }
    const rgb = lower.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgb) {
        const [r, g, b] = rgb.slice(1, 4).map(v => {
            const n = Math.max(0, Math.min(255, parseInt(v, 10) || 0));
            return n.toString(16).padStart(2, "0");
        });
        return `#${r}${g}${b}`;
    }
    const hsl = lower.match(/hsla?\(([-\d.]+)\s*,\s*([-\d.]+)%\s*,\s*([-\d.]+)%/i);
    if (hsl) {
        const h = parseFloat(hsl[1]); const s = parseFloat(hsl[2]); const l = parseFloat(hsl[3]);
        return hslToHex(h, s, l);
    }
    return "";
}

export function resolveCssColorToHex(requested: string, anchor: HTMLElement | null): string {
    if (!requested) return "";

    const val = requested.trim();

    const hexDirect = normalizeCssColorToHex(val);
    if (hexDirect) return hexDirect;

    const ref = anchor ?? document.body;
    const probe = document.createElement("span");
    probe.style.all = "unset";
    probe.style.position = "fixed";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    probe.textContent = "";

    if (val === "inherit" || val === "initial") {
        // inherit from parent
    } else {
        probe.style.color = val;
    }

    ref.appendChild(probe);
    const computed = getComputedStyle(probe).color || getComputedStyle(ref).color;
    probe.remove();

    return normalizeCssColorToHex(computed);
}
