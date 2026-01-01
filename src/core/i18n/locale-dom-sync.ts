
import { t } from "./index.ts";
import { LOCALE_CHANGED_EVENT } from "./events.ts";

let localeDomSyncInitialized = false;

function updatePlaceholderText(doc: Document) {
    const elements = doc.querySelectorAll<HTMLElement>("[data-placeholder-key]");
    elements.forEach((element) => {
        const key = element.dataset.placeholderKey;
        if (!key) return;
        element.setAttribute("data-placeholder", t(key as never));
    });
}

export function initLocaleDomSync(doc: Document = document) {
    if (localeDomSyncInitialized) return;
    localeDomSyncInitialized = true;

    const handleLocaleChange = () => updatePlaceholderText(doc);

    doc.addEventListener(LOCALE_CHANGED_EVENT, handleLocaleChange);
    updatePlaceholderText(doc);
}