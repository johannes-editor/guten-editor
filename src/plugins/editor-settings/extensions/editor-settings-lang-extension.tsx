/** @jsx h */
import { h, icons, appendElementOnOverlayArea, t } from "../../index.ts";
import { EditorSettingsExtensionPlugin } from "../editor-settings-plugin.tsx";
import { getAvailableLocales, setLocale } from "../../../core/i18n/index.ts";
import {
    applyLocalePreference,
    getCurrentLocalePreference,
    getStoredLocalePreference,
    clearStoredLocalePreference,
    setStoredLocalePreference,
} from "../../../core/i18n/locale-preference.ts";
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
        const locales = [
            { code: "auto", name: t("auto"), nativeName: t("auto") },
            ...getAvailableLocales(),
        ];
        const supportedLocales = new Set(locales.map((locale) => locale.code));
        const activeLocale = getStoredLocalePreference() ?? "auto";

        appendElementOnOverlayArea(
            <LangSelectMenu
                anchor={anchor}
                locales={locales}
                activeLocale={activeLocale === "auto" ? "auto" : getCurrentLocalePreference()}
                onLocaleSelect={(locale: string) => {
                    const resolvedLocale = applyLocalePreference(
                        locale,
                        supportedLocales,
                        document.documentElement.getAttribute("lang") ?? "en",
                    );
                    if (locale === "auto") {
                        clearStoredLocalePreference();
                    } else {
                        setStoredLocalePreference(resolvedLocale);
                    }
                    void setLocale(resolvedLocale);
                }}
            />
        );

        return false;

    }
}