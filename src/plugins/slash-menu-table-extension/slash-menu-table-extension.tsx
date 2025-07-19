/** @jsx h */
import { h } from "../../jsx.ts";
import { SlashMenuPluginExtension, SlashMenuPluginExtensionType } from "../slash-menu/slash-menu-plugin.tsx";
import { Plugin } from "../../core/plugin-engine/plugin.ts";
import { DomUtils } from "../../utils/dom-utils.ts";
import { CustomTable } from "./components/custom-table.tsx";
import { DataSkip } from "../../constants/data-skip.ts";
import { ClassName } from "../../constants/class-name.ts";

export class SlashMenuTablePluginExtension extends Plugin implements SlashMenuPluginExtension {

    private block: HTMLElement | null = null;

    sort: number = 9;
    range: Range | null = null;
    /**
     * Discriminator used by the system to identify this plugin as a SlashMenu extension.
     * Must be set to `SlashMenuPluginExtensionType`.
     */
    public readonly type = SlashMenuPluginExtensionType;

    label: string = "Table";

    onSelect(): void {

        if (this.block) {
            const element = DomUtils.insertElementAfter(this.block, <CustomTable class={ClassName.Block} data-skip={DataSkip.BlockInsertionNormalizer} contentEditable="false" />);
            const cell = element.querySelector("td");
            DomUtils.focusOnElement(cell);
        }
    }

    onMounted(): void {
        this.block = DomUtils.findClosestAncestorOfSelectionByClass(ClassName.Block);
    }

    override setup(_root: HTMLElement): void {
        // No setup required for this extension plugin.
    }
}