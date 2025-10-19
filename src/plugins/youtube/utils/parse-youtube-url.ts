export type YouTubeEmbedKind = "video" | "playlist";

export interface YouTubeEmbedData {
    embedUrl: string;
    kind: YouTubeEmbedKind;
    videoId?: string;
    playlistId?: string;
}

const SUPPORTED_HOSTS = ["youtu.be", "youtube.com", "youtube-nocookie.com"];

export function parseYouTubeUrl(raw: string): YouTubeEmbedData | null {
    if (!raw) return null;

    let url: URL;
    try {
        url = new URL(raw.trim());
    } catch {
        return null;
    }

    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    const isSupportedHost = SUPPORTED_HOSTS.some((candidate) => host === candidate || host.endsWith(`.${candidate}`));
    if (!isSupportedHost) return null;

    const path = url.pathname.replace(/\/+$/, "");
    const segments = path.split("/").filter(Boolean);

    let videoId = sanitizeId(url.searchParams.get("v"));
    let playlistId = sanitizeId(url.searchParams.get("list"));

    if (host === "youtu.be" && segments.length > 0) {
        videoId = sanitizeId(segments[0]) ?? videoId;
    }

    if (!videoId && segments.length > 0) {
        const [first, second] = segments;
        if (first === "watch") {
            videoId = sanitizeId(url.searchParams.get("v"));
        } else if (first === "shorts" && second) {
            videoId = sanitizeId(second);
        } else if (first === "embed" && second) {
            videoId = sanitizeId(second);
        } else if (first === "live" && second) {
            videoId = sanitizeId(second);
        }
    }

    if (!playlistId && segments[0] === "playlist") {
        playlistId = sanitizeId(segments[1]) ?? playlistId;
    }

    const startSeconds = parseStartSeconds(url);

    if (videoId) {
        const params = new URLSearchParams();
        if (playlistId) params.set("list", playlistId);
        if (typeof startSeconds === "number" && startSeconds > 0) params.set("start", String(startSeconds));

        const embedBase = `https://www.youtube.com/embed/${videoId}`;
        const query = params.toString();

        return {
            embedUrl: query ? `${embedBase}?${query}` : embedBase,
            kind: "video",
            videoId,
            playlistId: playlistId ?? undefined,
        };
    }

    if (playlistId) {
        const params = new URLSearchParams({ list: playlistId });
        const embedUrl = `https://www.youtube.com/embed/videoseries?${params.toString()}`;
        return {
            embedUrl,
            kind: "playlist",
            playlistId,
        };
    }

    return null;
}

function sanitizeId(value: string | null | undefined): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/[A-Za-z0-9_-]+/);
    return match ? match[0] : null;
}

function parseStartSeconds(url: URL): number | null {
    const raw = url.searchParams.get("start") ?? url.searchParams.get("t");
    if (!raw) return null;

    const value = raw.trim().toLowerCase();
    if (!value) return null;

    if (/^\d+$/.test(value)) {
        const asNumber = Number.parseInt(value, 10);
        return Number.isFinite(asNumber) ? asNumber : null;
    }

    const pattern = /(\d+)(h|m|s)/g;
    let total = 0;
    let matched = false;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(value)) !== null) {
        matched = true;
        const amount = Number.parseInt(match[1], 10);
        if (!Number.isFinite(amount)) continue;
        switch (match[2]) {
            case "h":
                total += amount * 3600;
                break;
            case "m":
                total += amount * 60;
                break;
            case "s":
                total += amount;
                break;
        }
    }

    return matched ? total : null;
}