/** @jsx h */

import { h } from "@core/jsx";
import { t } from "@core/i18n";
import { runCommand } from "@core/command";
import { CodeSlashIcon } from "@components/ui/icons";
import { FormattingToolbarExtensionPlugin } from "@plugin/formatting-toolbar";

export class FormattingToolbarItemCodeExtension extends FormattingToolbarExtensionPlugin {
    readonly icon: SVGElement = <CodeSlashIcon />;

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