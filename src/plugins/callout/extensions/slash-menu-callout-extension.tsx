import { runCommand } from "@core/command";
import { t } from "@core/i18n";
import { CardTextIcon } from "@components/ui/icons";
import { SlashMenuExtensionPlugin } from "@plugins/slash-menu";

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