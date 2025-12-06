/** @jsx h */

import { h, icons, runCommand, t } from "../../index.ts";
import { MobileToolbarButtonExtensionPlugin, MobileToolbarExtensionContext } from "../../mobile-toolbar/index.ts";

/**
 * Mobile toolbar extension that adds the Text Color menu when text is selected.
 */
export class MobileToolbarTextColorExtension extends MobileToolbarButtonExtensionPlugin {

    override buttons(context: MobileToolbarExtensionContext) {
        const selection = context.selection;
        const isSelectionMode = context.mode === "selection";
        const hasSelectedText = Boolean(selection && !selection.isCollapsed);

        if (!isSelectionMode || !hasSelectedText) return [];

        const anchorNode = selection?.anchorNode;
        const anchorElement = anchorNode instanceof HTMLElement
            ? anchorNode
            : anchorNode?.parentElement ?? undefined;

        return [{
            id: "text-color",
            icon: () => <icons.TextColorIcon />,
            label: t("text_color"),
            sort: 55,
            onClick: () => runCommand("openTextColorMenu", {
                content: { anchor: anchorElement },
            }),
        }];
    }
}