/** @jsx h */

import { MaterialChecklist } from "../../../design-system/components/icons.tsx";
import { h, t, focusOnElement } from "../../index.ts";
import { SlashMenuExtensionPlugin } from "../../slash-menu/index.ts";
import { createTodoList } from "../utils.tsx";

export class SlashMenuTodoListExtension extends SlashMenuExtensionPlugin {

    icon: SVGElement;
    label: string;
    sort: number;
    synonyms: string[];

    constructor() {
        super();
        this.icon = <MaterialChecklist />
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