/** @jsx h */

import { h } from "../../jsx.ts";
import { LinkIcon } from "../../design-system/components/icons.tsx";
import { FormattingToolbarExtensionPlugin } from "../formatting-toolbar/formatting-toolbar-plugin.tsx";

export class FormattingToolbarLinkExtensionPlugin extends FormattingToolbarExtensionPlugin {

    readonly icon: SVGElement = <LinkIcon />;
    readonly tooltip: string = "Insert Link";
    readonly sort: number = 5;

    onSelect(): void {
        const url = prompt("Enter the link URL::");
        if (url) {
            document.execCommand("createLink", false, url);

        }
    }
}