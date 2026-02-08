import { t, setLocale, getAvailableLocales } from "@core/i18n";
import {
    applyLocalePreference,
    DEFAULT_LOCALE,
    getStoredLocalePreference,
} from "@core/i18n";
import { appendElementOnContentArea, appendElementOnTitleArea, setRoot } from "@components/editor";
import { init } from "@core/plugin-engine";
import { Heading1Block, ParagraphBlock } from "@components/blocks";
import { getAvailableThemes } from "@design-system/themes";


import {
    DEFAULT_THEME,
    applyEditorTheme,
    clearStoredThemePreference,
    getStoredThemePreference,
} from "@utils/color/theme-preference.ts";
import { initLocaleDomSync } from "@core/i18n/locale-dom-sync.ts";
import { focusOnElement } from "@utils/dom";

/**
* Initializes the text editor.
*
* @param root The root HTML element where the editor will be mounted.
*/
export async function initEditor(root: HTMLElement) {

    const availableThemes = getAvailableThemes();
    const supportedThemes = new Set(availableThemes);

    const requestedThemeAttribute = (root.getAttribute("theme") || root.getAttribute("data-guten-theme") || DEFAULT_THEME).toLowerCase();
    const storedTheme = getStoredThemePreference()?.toLowerCase() ?? null;
    const storedThemeValid = storedTheme ? supportedThemes.has(storedTheme) : false;

    if (storedTheme && !storedThemeValid) {
        clearStoredThemePreference();
    }

    const requestedTheme = storedThemeValid ? storedTheme! : requestedThemeAttribute;

    applyEditorTheme(requestedTheme, supportedThemes);

    setRoot(root);

    // Set the language for the interface, defaulting to English if not specified.
    const availableLocales = getAvailableLocales();
    const supportedLocales = new Set(availableLocales.map((locale) => locale.code));

    const storedLocale = getStoredLocalePreference();
    const requestedLocale = storedLocale ?? "auto";
    const fallbackLocale = root.getAttribute("lang") ?? DEFAULT_LOCALE;
    const resolvedLocale = applyLocalePreference(requestedLocale, supportedLocales, fallbackLocale);
    root.setAttribute("lang", resolvedLocale);
    await setLocale(resolvedLocale);
    initLocaleDomSync(root.ownerDocument ?? document);

    /** Load the basic editor layout */
    appendElementOnTitleArea(
        <Heading1Block data-placeholder={t("untitled")} data-placeholder-key="untitled" />
    );

    focusOnElement(appendElementOnContentArea(<ParagraphBlock />));

    /** Init plugins */
    await init(root);
}

export function getEditorThemes(): string[] {
    return getAvailableThemes();
}