/** @jsx h */

import { h } from "@core/jsx";
import { t } from "@core/i18n";
import { Component } from "@core/components";
import type { YouTubeEmbedKind } from "../utils/parse-youtube-url.ts";

export interface YouTubeEmbedProps {
    embedUrl: string;
    sourceUrl: string;
    kind: YouTubeEmbedKind;
}

export class YouTubeEmbed extends Component<YouTubeEmbedProps> {

    static override styles = this.extendStyles(/*css */`
        .youtube-embed-container {
            position: relative;
            width: 100%;
            padding-bottom: 56.25%;
            background-color: #000;
            border-radius: var(--radius-md);
            overflow: hidden;
        }

        .youtube-embed-container iframe {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            border: 0;
        }
    ` );

    override connectedCallback(): void {
        super.connectedCallback();
        this.classList.add("block", "youtube-embed");
        this.setAttribute("contenteditable", "false");
        this.dataset.youtubeEmbed = "true";
    }

    override onMount(): void {
        this.dataset.youtubeSource = this.props.sourceUrl;
        this.dataset.youtubeKind = this.props.kind;
    }

    override render(): HTMLElement {
        return (
            <div class="youtube-embed-container">
                <iframe
                    src={this.props.embedUrl}
                    title={t(this.props.kind === "playlist" ? "youtube_playlist" : "youtube_video")}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen="true"
                ></iframe>
            </div>
        );
    }
}