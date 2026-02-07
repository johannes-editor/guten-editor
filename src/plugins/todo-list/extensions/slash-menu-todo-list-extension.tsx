import { t } from "@core/i18n";
import { MaterialChecklist } from "@components/ui/icons";
import { focusOnElement } from "@utils/dom";
import { SlashMenuExtensionPlugin } from "@plugin/slash-menu";
import { createTodoList } from "../utils.tsx";

export class SlashMenuTodoListExtension extends SlashMenuExtensionPlugin {

    icon: SVGElement;
    label: string;
    sort: number;
    override shortcut: string;
    override synonyms: string[];

    constructor() {
        super();
        this.icon = <MaterialChecklist />
        this.shortcut = "[]";
        this.label = t("todo_list");
        this.sort = 61;
        this.synonyms = [t("list"), t("checkbox"), t("todo")];
    }

    onSelect(focusedBlock: HTMLElement): void {
        const doc = focusedBlock.ownerDocument ?? document;
        const element = createTodoList(doc);
        focusedBlock.after(element);

        const span = element.querySelector<HTMLSpanElement>("span[contenteditable]");
        focusOnElement(span);
    }
}