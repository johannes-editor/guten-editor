import { runCommand } from "@core/command";
import { t } from "@core/i18n";
import { CodeBlockIcon } from "@components/ui/icons";
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