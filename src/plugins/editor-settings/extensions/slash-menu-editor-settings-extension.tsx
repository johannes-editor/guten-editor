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
    override preserveEmptyBlock: boolean;

    constructor() {
        super();

        this.icon = <SettingsIcon />;
        this.label = t("settings");
        this.synonyms = [t("language"), t("theme")];
        this.sort = 120;
        this.preserveEmptyBlock = true;
    }

    override onSelect(currentBlock: HTMLElement): void {
        const selection = globalThis.getSelection();
        const anchorNode = selection?.anchorNode ?? null;
        const anchorElement = anchorNode instanceof HTMLElement
            ? anchorNode
            : anchorNode?.parentElement ?? null;

        const editable = anchorElement?.closest('p,blockquote,h1,h2,h3,h4,h5,li,[contenteditable="true"]') as HTMLElement | null;
        const target = editable && currentBlock.contains(editable) ? editable : currentBlock;

        const meaningfulText = (target.textContent ?? '').replace(/[\s\u00A0\u200B]+/g, '');
        const hasStructuredChildren = Array.from(target.children).some((child) => child.tagName !== 'BR');

        if (meaningfulText.length === 0 && !hasStructuredChildren) {
            target.replaceChildren(document.createElement('br'));
        }

        const anchor = createAnchorAtSelection();
        if (!anchor) return;
        const items = getEditorSettingsItems();
        appendElementOnOverlayArea(<EditorSettingsMenu anchor={anchor} items={items} />);
    }
}