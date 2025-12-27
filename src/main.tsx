/** @jsx h */
import { Fragment, h } from "./jsx.ts";
import { setLocale, t } from "./core/i18n/index.ts";
import { appendElementOnContentArea, setRoot } from "./components/editor/index.tsx";
import { init } from "./core/plugin-engine/index.ts";
import { ParagraphBlock } from "./components/blocks/paragraph.tsx";
import { Heading1Block } from "./components/blocks/header1.tsx";
import { getAvailableThemes } from "./design-system/themes/index.ts";


const DEFAULT_THEME = "light";

/**
* Initializes the text editor.
* 
* @param root The root HTML element where the editor will be mounted.
*/
export async function initEditor(root: HTMLElement) {

    const availableThemes = getAvailableThemes();
    const supportedThemes = new Set(availableThemes);
    const requestedTheme = (root.getAttribute("theme") || DEFAULT_THEME).toLowerCase();
    const resolvedTheme = resolveThemePreference(requestedTheme);
    const theme = supportedThemes.has(resolvedTheme) ? resolvedTheme : DEFAULT_THEME;

    applyTheme(document.documentElement, theme);
    applyTheme(document.body, theme);
    applyTheme(root, theme);

    root.setAttribute("data-guten-theme", theme);
    root.setAttribute("theme", theme);

    if (requestedTheme === "auto") {
        listenToSystemThemeChanges(root, supportedThemes);
    }

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

function resolveThemePreference(requestedTheme: string): string {
    if (requestedTheme !== "auto") {
        return requestedTheme;
    }

    if (typeof window === "undefined" || typeof globalThis.matchMedia !== "function") {
        return DEFAULT_THEME;
    }

    return globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function listenToSystemThemeChanges(root: HTMLElement, supportedThemes: Set<string>): void {
  if (typeof globalThis === "undefined" || typeof globalThis.matchMedia !== "function") return;

  const mediaQueryList = globalThis.matchMedia("(prefers-color-scheme: dark)");

  const updateTheme = () => {
    const resolvedTheme = mediaQueryList.matches ? "dark" : "light";
    const nextTheme = supportedThemes.has(resolvedTheme) ? resolvedTheme : DEFAULT_THEME;
    applyTheme(document.documentElement, nextTheme);
    applyTheme(document.body, nextTheme);
    applyTheme(root, nextTheme);
    root.setAttribute("data-guten-theme", nextTheme);
    root.setAttribute("theme", nextTheme);
  };

  updateTheme();

  if (typeof mediaQueryList.addEventListener === "function") {
    mediaQueryList.addEventListener("change", updateTheme);
    return;
  }

  // Fallback for browsers that do not support addEventListener on MediaQueryList
  const mqlAny = mediaQueryList as unknown as { addListener?: (cb: () => void) => void };
  mqlAny.addListener?.(updateTheme);
}

export function getEditorThemes(): string[] {
    return getAvailableThemes();
}