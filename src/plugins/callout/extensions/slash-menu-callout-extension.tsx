/** @jsx h */
import { h, icons, runCommand, t } from "../../index.ts";
import { SlashMenuExtensionPlugin } from "../../slash-menu/index.ts";

export class SlashMenuCalloutExtension extends SlashMenuExtensionPlugin {

    override icon: SVGElement;
    override label: string;
    override sort: number;
    override synonyms: string[];

    constructor() {
        super();

        this.icon = <icons.CardTextIcon />
        this.label = t("callout");
        this.synonyms = [t("note"), t("highlight"), t("notice")];
        this.sort = 31;

    }

    override onSelect(currentBlock: HTMLElement): void {
        runCommand("insertCallout", { content: { afterBlock: currentBlock } });
    }
}