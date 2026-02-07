/** @jsx h */

import { h } from "@core/jsx";
import { t, setLocale, getAvailableLocales } from "@core/i18n";
import  * as localePreferences from "@core/i18n";
import { appendElementOnOverlayArea } from "@components/editor";
import { TranslationIcon } from "@components/ui/icons";
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