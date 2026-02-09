import { t } from "@core/i18n";
import { SettingsIcon } from "@components/ui/icons";
import { appendElementOnOverlayArea} from "@components/editor";
import { SlashMenuExtensionPlugin } from "@plugins/slash-menu";
import { createAnchorAtSelection } from "@utils/selection";
import { EditorSettingsMenu } from "../components/editor-settings-menu.tsx";
import { getEditorSettingsItems } from "../editor-settings-registry.ts";

export class SlashMenuEditorSettingsExtension extends SlashMenuExtensionPlugin {
    
    override icon: SVGElement;
    override label: string;
    override sort: number;
    override synonyms: string[];

    constructor() {
        super();

        this.icon = <SettingsIcon />;
        this.label = t("settings");
        this.synonyms = [t("language"), t("theme")];
        this.sort = 120;
    }

    override onSelect(): void {
        const anchor = createAnchorAtSelection();
        if (!anchor) return;
        const items = getEditorSettingsItems();
        appendElementOnOverlayArea(<EditorSettingsMenu anchor={anchor} items={items} />);
    }
}