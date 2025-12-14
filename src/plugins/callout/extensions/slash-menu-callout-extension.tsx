/** @jsx h */
import { h, icons, runCommand } from "../../index.ts";
import { SlashMenuExtensionPlugin } from "../../slash-menu/index.ts";

export class SlashMenuCalloutExtension extends SlashMenuExtensionPlugin {

    override icon: SVGElement;
    override label: string;
    override sort: number;

    constructor() {
        super();

        this.icon = <icons.CardTextIcon />
        this.label = "Callout";
        this.sort = 31;
    }

    override onSelect(currentBlock: HTMLElement): void {
        runCommand("insertCallout", { content: { afterBlock: currentBlock } });
    }
}