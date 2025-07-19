/** @jsx h */
import { Fragment, h } from "./jsx.ts";
import { setLocale, t } from "./core/i18n/index.ts";
import { appendChildren, setRoot } from "./core/editor-engine/index.ts";
import { init } from "./core/plugin-engine/index.ts";
import { ClassName } from "./constants/class-name.ts";

/**
* Initializes the text editor.
* 
* @param root The root HTML element where the editor will be mounted.
*/
export async function initEditor(root: HTMLElement) {

    setRoot(root);
    // Set the language for the interface, defaulting to English if not specified.
    const lang = root.getAttribute("lang") || "en";
    await setLocale(lang);

    /** Load the basic editor layout */
    appendChildren(
        <Fragment>
            <h1 class={`${ClassName.Block} ${ClassName.Placeholder} ${ClassName.Empty}`} data-placeholder={t("untitled")}><br/></h1>
            <p class={`${ClassName.Block} ${ClassName.Placeholder} ${ClassName.Empty}`} data-placeholder={t("startTyping")}><br/></p>
        </Fragment>
    );

    /** Init plugins */
    await init(root);
}