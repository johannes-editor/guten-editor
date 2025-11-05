/** @jsx h */

import { CodeBlockIcon } from "../../../design-system/components/icons.tsx";
import { focusOnElement, h, t } from "../../index.ts";
import { SlashMenuExtensionPlugin } from "../../slash-menu/index.ts";
import { CodeBlock } from "../components/code-block.tsx";


export class SlashMenuCodeBlockExtension extends SlashMenuExtensionPlugin {

    icon: SVGElement;
    label: string;
    sort: number;

    constructor() {
        super();
        
        this.label = t("code");
        this.icon = <CodeBlockIcon />;
        this.sort = 99;
    }

    override onSelect(currentBlock: HTMLElement): void {
        const codeBlock = <CodeBlock />;
        currentBlock.after(codeBlock);
        const code = codeBlock.querySelector("code");
        focusOnElement(code);
    }
}