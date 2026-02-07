/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { t } from "@core/i18n/index.ts";
import { PaletteIcon } from "@components/ui/primitives/icons.tsx";
import { appendElementOnOverlayArea } from "@components/editor/core/index.tsx";
import { getAvailableThemes } from "@design-system/themes/index.ts";
import * as themePreferences from "@/utils/color/theme-preference.ts";
import { ThemeSelectMenu } from "../components/theme-select-menu.tsx";
import { EditorSettingsExtensionPlugin } from "../editor-settings-plugin.tsx";

export class EditorSettingsThemeExtension extends EditorSettingsExtensionPlugin {
    override icon: SVGElement;
    override label: string;
    override sort: number;
    override rightIndicator: "auto" | "check" | "chevron" | "none" = "chevron";

    constructor() {
        super();

        this.icon = <PaletteIcon />;
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
                activeTheme={themePreferences.getCurrentThemePreference()}
                onThemeSelect={(theme: string) => {
                    if (theme === "auto") {
                        themePreferences.clearStoredThemePreference();
                    } else {
                        themePreferences.setStoredThemePreference(theme);
                    }

                    themePreferences.applyEditorTheme(theme, supportedThemes);
                }}
            />
        );

        return false;
    }
}