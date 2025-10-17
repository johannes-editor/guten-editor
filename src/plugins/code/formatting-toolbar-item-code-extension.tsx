/** @jsx h */

import { h } from "../../jsx.ts";
import { icons, runCommand, t, FormattingToolbarExtensionPlugin } from "../index.ts";

export class FormattingToolbarItemCodeExtension extends FormattingToolbarExtensionPlugin {
    readonly icon: SVGElement = <icons.CodeSlashIcon />;

    readonly label: string = t("code");

    readonly shortcut: string = "Mod+B+C";

    readonly sort: number = 50;

    onSelect(): void {
        runCommand("openLinkPopover");
    }
}