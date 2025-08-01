/** @jsx h */

import { h, OverlayComponent } from "../../index.ts";

interface FormattingToolbarProps {
    removeToolbarInstance: () => void;
}

export class FormattingToolbar extends OverlayComponent<FormattingToolbarProps> {

    override closeOnClickOutside: boolean = false;

    static override getTagName(): string {
        return "guten-formatting-toolbar";
    }

    static override styles? = /*css*/ `
        guten-formatting-toolbar ul{
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: row;
            gap: 0.5rem;
            background-color: white;
            border: 1px solid black;
            border-radius: 0.25rem;
            padding: 0.5rem;
        }
        guten-formatting-toolbar li{
            list-style: none;
        }
    `;

    override render(): HTMLElement {
        return (
            <div>
                <ul>
                    <li><button type="button" onclick="document.execCommand('bold')" >Bold</button></li>
                    <li><button type="button" onclick="document.execCommand('italic')">Italic</button></li>
                    <li><button type="button" onclick="document.execCommand('strikeThrough')">Strikethrough</button></li>
                    <li><button type="button" onclick="document.execCommand('underline')">Underline</button></li>
                </ul>
            </div>
        );
    }

    override onMount(): void {

        // this.positionToolbarNearSelection();

        requestAnimationFrame(() => {
            this.positionToolbarNearSelection();
        });

        this.registerEvent(document, "selectionchange", () => this.handleSelectionChange());
    }

    override onUnmount(): void {
        this.props.removeToolbarInstance();
    }

    handleSelectionChange = () => {
        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0 || selection.toString().trim() === "") {
            this.remove();
            return;
        }
    }

    // positionToolbarNearSelection(): void {
    //     const selection = window.getSelection();
    //     if (!selection || selection.rangeCount === 0 || selection.toString().trim() === "") {
    //         return;
    //     }

    //     const range = selection.getRangeAt(0);
    //     const rect = range.getBoundingClientRect(); // mais confiável

    //     this.setPosition(rect);
    // }

    positionToolbarNearSelection(): void {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.toString().trim() === "") {
            return;
        }

        const range = selection.getRangeAt(0);
        const rects = range.getClientRects();
        if (rects.length === 0) return;

        const isBackward = this.isSelectionBackward(selection);

        const rect = isBackward
            ? rects[0]                     
            : rects[rects.length - 1];     

        this.setPosition(rect);
    }

    private isSelectionBackward(selection: Selection): boolean {
        const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;

        if (!anchorNode || !focusNode) return false; 

        if (anchorNode === focusNode) {
            return focusOffset < anchorOffset;
        }

        const position = anchorNode.compareDocumentPosition(focusNode);
        return !!(position & Node.DOCUMENT_POSITION_PRECEDING);
    }

    private setPosition(rect: DOMRect): void {
        const elementWidth = this.offsetWidth;
        const elementHeight = this.offsetHeight;

        console.log("Toolbar offsetWidth:", elementWidth);
        console.log("Selection rect:", rect);

        let leftPosition = rect.left + window.scrollX + (rect.width / 2) - (elementWidth / 2);
        let topPosition = rect.top + window.scrollY - elementHeight - 10;

        if (leftPosition + elementWidth > window.innerWidth) {
            leftPosition = window.innerWidth - elementWidth - 20;
        }

        if (leftPosition < 20) {
            leftPosition = 20;
        }

        if (topPosition < 0) {
            topPosition = rect.bottom + window.scrollY + 10;
        }

        this.style.left = `${leftPosition}px`;
        this.style.top = `${topPosition}px`;
        this.style.display = 'flex';
    }
}