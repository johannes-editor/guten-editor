/** @jsx h */

import { h } from "../../../jsx.ts";
import { icons, runCommand, t, FormattingToolbarExtensionPlugin } from "../../index.ts";

export class FormattingToolbarItemCodeExtension extends FormattingToolbarExtensionPlugin {
    readonly icon: SVGElement = <icons.CodeSlashIcon />;

    readonly label: string = t("code");

    readonly shortcut: string = "Mod+B+C";

    readonly sort: number = 70;

    onSelect(): void {
        runCommand("toggleInlineCode");
    }


    

    override isActive = (): boolean => {
        try {
            const result = !!runCommand("stateInlineCode");
            console.log("FormattingToolbarItemCodeExtension isActive:", result);
            return result;
        } catch {
            return false;
        }
    };
}