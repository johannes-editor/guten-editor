/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { runCommand } from "@core/command/index.ts";
import { t } from "@core/i18n/index.ts";
import { CodeBlockIcon } from "@components/ui/primitives/icons.tsx";
import { SlashMenuExtensionPlugin } from "../../slash-menu/index.ts";

export class SlashMenuCodeBlockExtension extends SlashMenuExtensionPlugin {

    icon: SVGElement;
    label: string;
    sort: number;
    override shortcut: string;

    constructor() {
        super();
        
        this.label = t("code");
        this.shortcut = "```";
        this.icon = <CodeBlockIcon />;
        this.sort = 99;
    }

    override onSelect(currentBlock: HTMLElement): void {
        runCommand("insertCodeBlock", { content: { afterBlock: currentBlock } });
    }
}