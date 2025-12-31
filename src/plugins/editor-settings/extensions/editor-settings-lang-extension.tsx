/** @jsx h */
import { h, icons, appendElementOnOverlayArea, t } from "../../index.ts";
import { EditorSettingsExtensionPlugin } from "../editor-settings-plugin.tsx";

import {
    applyEditorTheme,
    clearStoredThemePreference,
    getCurrentThemePreference,
    setStoredThemePreference,
} from "../../../utils/color/theme-preference.ts";
import { LangSelectMenu } from "../components/lang-select-menu.tsx";

export class EditorSettingsLangExtension extends EditorSettingsExtensionPlugin {
    override icon: SVGElement;
    override label: string;
    override sort: number;
    override rightIndicator: "auto" | "check" | "chevron" | "none" = "chevron";

    constructor() {
        super();

        this.icon = <icons.TranslationIcon />;
        this.label = t("language");
        this.sort = 10;
    }

    override onSelect(anchor: HTMLElement): boolean | void {
        const themes = ["PT", "EN", "ES", "FR", "ZH", "JA"];
        const supportedThemes = new Set(themes);
        const availableThemes = [...themes];

        appendElementOnOverlayArea(
            <LangSelectMenu
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