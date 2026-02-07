/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { t, setLocale, getAvailableLocales } from "@core/i18n/index.ts";
import  * as localePreferences from "@core/i18n/locale-preference.ts";
import { appendElementOnOverlayArea } from "@components/editor/core/index.tsx";
import { TranslationIcon } from "@components/ui/primitives/icons.tsx";
import { LangSelectMenu } from "../components/lang-select-menu.tsx";
import { EditorSettingsExtensionPlugin } from "../editor-settings-plugin.tsx";

export class EditorSettingsLangExtension extends EditorSettingsExtensionPlugin {
    override icon: SVGElement;
    override label: string;
    override sort: number;
    override rightIndicator: "auto" | "check" | "chevron" | "none" = "chevron";

    constructor() {
        super();

        this.icon = <TranslationIcon />;
        this.label = t("language");
        this.sort = 10;
    }

    override onSelect(anchor: HTMLElement): boolean | void {
        const locales = [
            { code: "auto", name: t("auto"), nativeName: t("auto") },
            ...getAvailableLocales(),
        ];
        const supportedLocales = new Set(locales.map((locale) => locale.code));
        const activeLocale = localePreferences.getStoredLocalePreference() ?? "auto";

        appendElementOnOverlayArea(
            <LangSelectMenu
                anchor={anchor}
                locales={locales}
                activeLocale={activeLocale === "auto" ? "auto" : localePreferences.getCurrentLocalePreference()}
                onLocaleSelect={(locale: string) => {
                    const resolvedLocale = localePreferences.applyLocalePreference(
                        locale,
                        supportedLocales,
                        document.documentElement.getAttribute("lang") ?? "en",
                    );
                    if (locale === "auto") {
                        localePreferences.clearStoredLocalePreference();
                    } else {
                        localePreferences.setStoredLocalePreference(resolvedLocale);
                    }
                    void setLocale(resolvedLocale);
                }}
            />
        );

        return false;
    }
}