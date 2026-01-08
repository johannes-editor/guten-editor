/** @jsx h */
import { h, icons, appendElementOnOverlayArea, t } from "../../index.ts";
import { SlashMenuExtensionPlugin } from "../../slash-menu/index.ts";
import { EditorSettingsMenu } from "../components/editor-settings-menu.tsx";
import { getEditorSettingsItems } from "../editor-settings-registry.ts";
import { selection } from "../../index.ts";

export class SlashMenuEditorSettingsExtension extends SlashMenuExtensionPlugin {
    
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
        const anchor = selection.createAnchorAtSelection();
        if (!anchor) return;
        const items = getEditorSettingsItems();
        appendElementOnOverlayArea(<EditorSettingsMenu anchor={anchor} items={items} />);
    }
}