/** @jsx h */
import { Fragment, h } from "./jsx.ts";
import { setLocale, t } from "./core/i18n/index.ts";
import { appendElementOnContentArea, setRoot } from "./components/editor/index.tsx";
import { init } from "./core/plugin-engine/index.ts";
import { ParagraphBlock } from "./components/blocks/paragraph.tsx";
import { Heading1Block } from "./components/blocks/header1.tsx";
import { bootstrapDefaultSchema } from "./core/schema/bootstrap.ts";

/**
* Initializes the text editor.
* 
* @param root The root HTML element where the editor will be mounted.
*/
export async function initEditor(root: HTMLElement) {

    setRoot(root);
    bootstrapDefaultSchema();
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