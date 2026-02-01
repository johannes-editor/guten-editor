/** @jsx h */

import { CodeBlockIcon } from "../../../design-system/components/icons.tsx";
import { h, runCommand, t } from "../../index.ts";
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