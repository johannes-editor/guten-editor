/** @jsx h */
import { Fragment, h } from "./jsx.ts";
import { getAvailableLocales, setLocale, t } from "./core/i18n/index.ts";
import {
    applyLocalePreference,
    DEFAULT_LOCALE,
    getStoredLocalePreference,
} from "./core/i18n/locale-preference.ts";
import { appendElementOnContentArea, setRoot } from "./components/editor/index.tsx";
import { init } from "./core/plugin-engine/index.ts";
import { ParagraphBlock } from "./components/blocks/paragraph.tsx";
import { Heading1Block } from "./components/blocks/header1.tsx";
import { getAvailableThemes } from "./design-system/themes/index.ts";


import {
    DEFAULT_THEME,
    applyEditorTheme,
    clearStoredThemePreference,
    getStoredThemePreference,
} from "./utils/color/theme-preference.ts";
import { initLocaleDomSync } from "./core/i18n/locale-dom-sync.ts";

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
    appendElementOnContentArea(
        <Fragment>
            <Heading1Block data-placeholder={t("untitled")} data-placeholder-key="untitled" />
            <ParagraphBlock />
        </Fragment>
    );

    /** Init plugins */
    await init(root);
}

export function getEditorThemes(): string[] {
    return getAvailableThemes();
}