/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { Command } from "@core/command/command.ts";
import { YouTubeEmbed } from "../components/youtube-embed.tsx";
import { YouTubePlaceholder } from "../components/youtube-placeholder.tsx";
import type { YouTubeEmbedKind } from "../utils/parse-youtube-url.ts";

export type InsertYouTubeEmbedPayload = {
    target?: HTMLElement | null;
    sourceUrl: string;
    embedUrl: string;
    kind: YouTubeEmbedKind;
};

export const InsertYouTubeEmbed: Command<InsertYouTubeEmbedPayload> = {
    id: "insertYouTubeEmbed",
    execute(context): boolean {
        const payload = context?.content;
        if (!payload) return false;

        const element = <YouTubeEmbed embedUrl={payload.embedUrl} sourceUrl={payload.sourceUrl} kind={payload.kind} />;
        const target = payload.target ?? null;

        if (target && target.isConnected) {
            if (target.matches(YouTubePlaceholder.getTagName()) || target.matches(YouTubeEmbed.getTagName())) {
                target.replaceWith(element);
            } else {
                target.after(element);
                target.remove();
            }
        } else {
            const selection = globalThis.getSelection();
            if (selection?.rangeCount) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(element);
            }
        }

        return true;
    },
};