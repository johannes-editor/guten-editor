/** @jsx h */

import { CardImageIcon } from "../../../design-system/components/icons.tsx";
import { BlockObjectPlaceholderUI } from "../../../design-system/components/block-object-placeholder-ui.tsx";
import { h, t } from "../../index.ts";


export class ImagePlaceholder extends BlockObjectPlaceholderUI {

    constructor() {
        super(<CardImageIcon />, t("insert_image"));
    }

    override onClick() {
        window.alert("clicked");
    }
}