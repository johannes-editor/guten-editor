/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { t } from "@core/i18n/index.ts";
import { runCommand } from "@core/command/index.ts";
import { TextColorIcon } from "@components/ui/primitives/icons.tsx";
import { MobileToolbarButtonExtensionPlugin, MobileToolbarExtensionContext } from "@plugin/mobile-toolbar/index.ts";

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
            icon: () => <TextColorIcon />,
            label: t("text_color"),
            sort: 55,
            onClick: () => runCommand("openTextColorMenu", {
                content: { anchor: anchorElement },
            }),
        }];
    }
}