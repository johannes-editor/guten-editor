/** @jsx h */

import { CardImageIcon } from "../../../design-system/components/icons.tsx";
import { ObjectPlaceholderUI } from "../../../design-system/components/object-placeholder-ui.tsx";
import { h, t } from "../../index.ts";


export class ImagePlaceholder extends ObjectPlaceholderUI {

    constructor() {
        super(<CardImageIcon />, t("insert_image"));
    }

    override onClick() {
        window.alert("clicked");
    }
}