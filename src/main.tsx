/** @jsx h */
import { Fragment, h } from "./jsx.ts";
import { setLocale, t } from "./core/i18n/index.ts";
import { appendElementOnContentArea, setRoot } from "./components/editor/index.tsx";
import { init } from "./core/plugin-engine/index.ts";
import { ParagraphBlock } from "./components/blocks/paragraph.tsx";
import { Heading1Block } from "./components/blocks/header1.tsx";


const SUPPORTED_THEMES = new Set(["light", "dark", "dracula"]);
const DEFAULT_THEME = "light";

/**
* Initializes the text editor.
* 
* @param root The root HTML element where the editor will be mounted.
*/
export async function initEditor(root: HTMLElement) {

    const requestedTheme = (root.getAttribute("theme") || DEFAULT_THEME).toLowerCase();
    const theme = SUPPORTED_THEMES.has(requestedTheme) ? requestedTheme : DEFAULT_THEME;

    applyTheme(document.documentElement, theme);
    applyTheme(document.body, theme);
    applyTheme(root, theme);

    root.setAttribute("data-guten-theme", theme);
    root.setAttribute("theme", theme);

    setRoot(root);
    // Set the language for the interface, defaulting to English if not specified.
    const lang = root.getAttribute("lang") || "en";
    await setLocale(lang);

    /** Load the basic editor layout */
    appendElementOnContentArea(
        <Fragment>
            <Heading1Block data-placeholder={t("untitled")} />
            <ParagraphBlock />
        </Fragment>
    );

    /** Init plugins */
    await init(root);
}

function applyTheme(target: HTMLElement | null, theme: string) {
    target?.setAttribute("data-guten-theme", theme);
    target?.setAttribute("theme", theme);
}