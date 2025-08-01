/** @jsx h */

import { h, ExtensiblePlugin, PluginExtension, EventTypes, KeyboardKeys, appendElementOnOverlayArea, debounce } from "../index.ts";
import { FormattingToolbar } from "./component/formatting-toolbar.tsx";


export class FormattingToolbarPlugin extends ExtensiblePlugin<FormattingToolbarExtensionPlugin> {

    private static toolbarInstance: HTMLElement | null = null;

    override initialize(_root: HTMLElement, _extensions: FormattingToolbarExtensionPlugin[]): void {

        document.addEventListener(EventTypes.MouseUp, debounce(() => this.handleMouseUp(), 100) as EventListener);

        document.addEventListener(EventTypes.KeyUp, debounce((event: KeyboardEvent) => {
            console.log("Key up event:", event.key);
            if (event.key === KeyboardKeys.Shift) {
                this.handleMouseUp();
            }
        }, 100) as EventListener);
    }

    removeToolbarInstance(): void {
        FormattingToolbarPlugin.toolbarInstance = null;
    }

    private handleMouseUp(): void {
        if (!FormattingToolbarPlugin.toolbarInstance) {
            const selection = window.getSelection();

            if (selection && selection.rangeCount > 0 && selection.toString().trim() !== "") {
                FormattingToolbarPlugin.toolbarInstance = appendElementOnOverlayArea(<FormattingToolbar removeToolbarInstance={this.removeToolbarInstance} />);
            }
        }
    }
}

export abstract class FormattingToolbarExtensionPlugin extends PluginExtension<FormattingToolbarPlugin> {

    override readonly target = FormattingToolbarPlugin;

    abstract readonly icon: string;
    abstract readonly label: string;
    abstract readonly sort: number;
    abstract onSelect(): void;
}