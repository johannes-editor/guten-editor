/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { runCommand } from "@core/command/index.ts";
import { t } from "@core/i18n/index.ts";
import { CardTextIcon } from "@components/ui/primitives/icons.tsx";
import { SlashMenuExtensionPlugin } from "@plugin/slash-menu/index.ts";

export class SlashMenuCalloutExtension extends SlashMenuExtensionPlugin {

    override icon: SVGElement;
    override label: string;
    override sort: number;
    override synonyms: string[];

    constructor() {
        super();

        this.icon = <CardTextIcon />;
        this.label = t("callout");
        this.synonyms = [t("note"), t("highlight"), t("notice")];
        this.sort = 31;
    }

    override onSelect(currentBlock: HTMLElement): void {
        runCommand("insertCallout", { content: { afterBlock: currentBlock } });
    }
}