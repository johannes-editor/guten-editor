/** @jsx h */

import { h } from "../../jsx.ts";
import { EventTypes } from "../../constants/event-types.ts";
import { Component } from "../component.ts";
import { appendElementOnContentArea } from "../../core/editor-engine/index.ts";
import { ParagraphBlock } from "../blocks/paragraph.tsx";
import { focusOnElement } from "../../utils/dom-utils.ts";

export class ParagraphTrigger extends Component {

    static override styles = /*css*/ `
        #paragraphTriggerArea {
            height: 3rem;
            width: 100%;
        }
    `;

    override onMount(): void {
        this.registerEvent(this, EventTypes.Click, this.handleClick)
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