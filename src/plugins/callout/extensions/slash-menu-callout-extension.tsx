/** @jsx h */
import { h, focusOnElement, icons } from "../../index.ts";
import { SlashMenuExtensionPlugin } from "../../slash-menu/index.ts";
import { CalloutBlock } from "../components/callout-block.tsx";

export class SlashMenuCalloutExtension extends SlashMenuExtensionPlugin {

    override icon: SVGElement;
    override label: string;
    override sort: number;

    constructor() {
        super();

        this.icon = <icons.CardTextIcon />
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