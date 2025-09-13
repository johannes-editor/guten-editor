/** @jsx h */
import { h } from '../../jsx.ts';
import { SlashMenuExtensionPlugin } from "../slash-menu/index.ts";
import { CalloutBlock } from "./components/callout-block.tsx";
import { focusOnElement } from "../index.ts";
import { CardTextIcon } from "../../design-system/components/icons.tsx";

export class CalloutPlugin extends SlashMenuExtensionPlugin {

    override icon: SVGElement;
    override label: string;
    override sort: number;

    constructor() {
        super();

        this.icon = <CardTextIcon />
        this.label = "Callout";
        this.sort = 31;
    }

    override onSelect(currentBlock: HTMLElement): void {
        const callout = <CalloutBlock />;
        currentBlock.after(callout);
        const paragraph = callout.querySelector("p");
        focusOnElement(paragraph);
    }
}