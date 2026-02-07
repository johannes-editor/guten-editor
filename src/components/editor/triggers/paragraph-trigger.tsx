/** @jsx h */

import { h } from "@core/jsx";
import { Component } from "@core/components";
import { appendElementOnContentArea } from "@components/editor";
import { ParagraphBlock } from "../../blocks/paragraph.tsx";
import { focusOnElement } from "@utils/dom";
import { dom } from "../../../utils/index.ts";

export class ParagraphTrigger extends Component {

    static override getTagName(): string {
        return "x-p-trigger";
    }

    static override styles = /*css*/ `
        #paragraphTriggerArea {
            height: 7rem;
            width: 100%;
        }
    `;

    override onMount(): void {
        this.registerEvent(this, dom.EventTypes.Click, this.handleClick)
    }

    private readonly handleClick = () => {

        const element = appendElementOnContentArea(<ParagraphBlock />)
        focusOnElement(element);
        ;
    };

    override render(): HTMLElement {
        return (<div id="paragraphTriggerArea"></div>);
    }
}