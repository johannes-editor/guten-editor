/** @jsx h */
import { h, icons, appendElementOnOverlayArea, t } from "../../index.ts";
import { SlashMenuExtensionPlugin } from "../../slash-menu/index.ts";
import { SelectionUtils } from "../../../utils/selection/selection-utils.ts";
import { EditorSettingsMenu } from "../components/editor-settings-menu.tsx";
import { getEditorSettingsItems } from "../editor-settings-registry.ts";

function createAnchorAtSelection(): HTMLElement | null {
    const selectionRange = SelectionUtils.getCurrentSelectionRange();
    if (!selectionRange) return null;

    const anchor = document.createElement("span");
    anchor.className = "guten-editor-settings-anchor";
    anchor.dataset.gutenSettingsAnchor = "true";
    anchor.textContent = "\u200b";
    anchor.style.display = "inline-block";
    anchor.style.width = "0";
    anchor.style.height = "0";
    anchor.style.padding = "0";
    anchor.style.margin = "0";
    anchor.style.lineHeight = "0";

    selectionRange.insertNode(anchor);
    selectionRange.setStartAfter(anchor);
    selectionRange.setEndAfter(anchor);

    const selection = globalThis.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(selectionRange);

    return anchor;
}

export class SlashMenuEditorSettingsExtension extends SlashMenuExtensionPlugin {
    override shortcut?: string | undefined; // todo
    override icon: SVGElement;
    override label: string;
    override sort: number;

    constructor() {
        super();

        this.icon = <icons.SettingsIcon />;
        this.label = t("settings");
        this.sort = 120;
    }

    override onSelect(): void {
        const anchor = createAnchorAtSelection();
        if (!anchor) return;
        const items = getEditorSettingsItems();
        appendElementOnOverlayArea(<EditorSettingsMenu anchor={anchor} items={items} />);
    }
}