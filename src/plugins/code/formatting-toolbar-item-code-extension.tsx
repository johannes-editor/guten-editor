/** @jsx h */

import { h } from "../../jsx.ts";
import { CodeSlashIcon } from "../../design-system/components/icons.tsx";
import { FormattingToolbarExtensionPlugin } from "../formatting-toolbar/formatting-toolbar-plugin.tsx";
import { runCommand, t } from "../index.ts";

export class FormattingToolbarItemCodeExtension extends FormattingToolbarExtensionPlugin {
    readonly icon: SVGElement = <CodeSlashIcon />;

    readonly label: string = t("code");

    readonly shortcut: string = "Mod+B+C";

    readonly sort: number = 50;

    onSelect(): void {
        runCommand("openLinkPopover");
    }
}