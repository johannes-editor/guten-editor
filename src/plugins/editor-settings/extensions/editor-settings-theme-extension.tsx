/** @jsx h */
import { h, icons, appendElementOnOverlayArea, t } from "../../index.ts";
import { EditorSettingsExtensionPlugin } from "../editor-settings-plugin.tsx";
import { ThemeSelectMenu } from "../components/theme-select-menu.tsx";
import { getAvailableThemes } from "../../../design-system/themes/index.ts";
import {
    applyEditorTheme,
    clearStoredThemePreference,
    getCurrentThemePreference,
    setStoredThemePreference,
} from "../../../utils/color/theme-preference.ts";

export class EditorSettingsThemeExtension extends EditorSettingsExtensionPlugin {
    override icon: SVGElement;
    override label: string;
    override sort: number;
    override rightIndicator: "auto" | "check" | "chevron" | "none" = "chevron";

    constructor() {
        super();

        this.icon = <icons.PaletteIcon />;
        this.label = t("theme");
        this.sort = 10;
    }

    override onSelect(anchor: HTMLElement): boolean | void {
        const themes = getAvailableThemes();
        const supportedThemes = new Set(themes);
        const availableThemes = ["auto", ...themes];

        appendElementOnOverlayArea(
            <ThemeSelectMenu
                anchor={anchor}
                themes={availableThemes}
                activeTheme={getCurrentThemePreference()}
                onThemeSelect={(theme: string) => {
                    if (theme === "auto") {
                        clearStoredThemePreference();
                    } else {
                        setStoredThemePreference(theme);
                    }

                    applyEditorTheme(theme, supportedThemes);
                }}
            />
        );

        return false;
    }
}