/** @jsx h */

import { h } from "../../../jsx.ts";
import { icons, runCommand, t, FormattingToolbarExtensionPlugin } from "../../index.ts";

export class FormattingToolbarItemCodeExtension extends FormattingToolbarExtensionPlugin {
    readonly icon: SVGElement = <icons.CodeSlashIcon />;

    readonly label: string = t("code");

    readonly shortcut: string = "Mod+E";

    readonly sort: number = 70;

    onSelect(): void {
        runCommand("toggleInlineCode");
    }

    override isActive = (): boolean => {
        try {
            return !!runCommand("stateInlineCode");
        } catch {
            return false;
        }
    };
}