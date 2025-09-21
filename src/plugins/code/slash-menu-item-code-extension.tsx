/** @jsx h */

import { CodeBlockIcon } from "../../design-system/components/icons.tsx";
import { h, t } from "../index.ts";
import { SlashMenuExtensionPlugin } from "../slash-menu/index.ts";

export class SlashMenuItemCodeExtension extends SlashMenuExtensionPlugin {

    icon: SVGElement;
    label: string;
    sort: number;

    constructor() {

        super();
        this.label = t("code");
        this.icon = <CodeBlockIcon />;
        this.sort = 99;
    }

    onSelect(focusedBlock: HTMLElement): void {

    }
}