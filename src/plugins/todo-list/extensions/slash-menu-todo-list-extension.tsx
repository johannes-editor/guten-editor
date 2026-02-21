import { t } from "@core/i18n";
import { ListDetailsIcon } from "@components/ui/icons";
import { focusOnElement } from "@utils/dom";
import { SlashMenuExtensionPlugin } from "@plugins/slash-menu";
import { TodoListBlock } from "../components/todo-list.tsx";

export class SlashMenuTodoListExtension extends SlashMenuExtensionPlugin {

    icon: SVGElement;
    label: string;
    sort: number;
    override shortcut: string;
    override synonyms: string[];

    constructor() {
        super();
        this.icon = <ListDetailsIcon />
        this.shortcut = "[]";
        this.label = t("todo_list");
        this.sort = 61;
        this.synonyms = [t("list"), t("checkbox"), t("todo")];
    }

    onSelect(focusedBlock: HTMLElement): void {
        const element = <TodoListBlock />;
        focusedBlock.after(element);

        const span = element.querySelector<HTMLSpanElement>("span[contenteditable]");
        focusOnElement(span);
    }
}