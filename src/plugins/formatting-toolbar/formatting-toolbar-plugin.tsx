/** @jsx h */

import { h, ExtensiblePlugin, PluginExtension, EventTypes, KeyboardKeys, appendElementOnOverlayArea, debounce, hasSelection } from "../index.ts";
import { FormattingToolbar } from "./component/formatting-toolbar.tsx";

export class FormattingToolbarPlugin extends ExtensiblePlugin<FormattingToolbarExtensionPlugin> {

    private static toolbarInstance: HTMLElement | null = null;

    override initialize(_root: HTMLElement, _extensions: FormattingToolbarExtensionPlugin[]): void {

        document.addEventListener(EventTypes.MouseUp, debounce(() => this.handleSelection(), 100) as EventListener);

        document.addEventListener(EventTypes.KeyUp, debounce((event: KeyboardEvent) => {
            if (event.key === KeyboardKeys.Shift) {
                this.handleSelection();
            }
        }, 100) as EventListener);
    }

    removeToolbarInstance(): void {
        FormattingToolbarPlugin.toolbarInstance = null;
    }

    private handleSelection(): void {
        if (!FormattingToolbarPlugin.toolbarInstance && hasSelection()) {

            const formattingToolbar =
                <FormattingToolbar removeToolbarInstance={this.removeToolbarInstance}>
                    <li><button type="button" onClick={() => document.execCommand('bold')}>Bold</button></li>
                    <li><button type="button" onClick={() => document.execCommand('italic')}>Italic</button></li>
                    <li><button type="button" onClick={() => document.execCommand('strikeThrough')}>Strikethrough</button></li>
                    <li><button type="button" onClick={() => document.execCommand('underline')}>Underline</button></li>
                </FormattingToolbar>;

            appendElementOnOverlayArea(formattingToolbar);
            FormattingToolbarPlugin.toolbarInstance = formattingToolbar;
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