/** @jsx h */
import { h } from '../../jsx.ts';
import { SlashMenuExtensionPlugin } from "../slash-menu/index.ts";
import { CalloutBlock } from "./components/callout-block.tsx";
import { focusOnElement } from "../index.ts";

export class CalloutPlugin extends SlashMenuExtensionPlugin {

    override label: string;
    override sort: number;

    constructor() {
        super();

        this.label = "Callout";
        this.sort = 10;
    }

    override onSelect(currentBlock: HTMLElement): void {
        const callout = <CalloutBlock />;
        currentBlock.after(callout);
        const paragraph = callout.querySelector("p");
        focusOnElement(paragraph);
    }
}