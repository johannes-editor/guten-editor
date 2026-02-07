/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { t } from "@core/i18n/index.ts";
import { runCommand } from "@core/command/index.ts";
import { CodeSlashIcon } from "@components/ui/primitives/icons.tsx";
import { FormattingToolbarExtensionPlugin } from "@plugin/formatting-toolbar/index.ts";

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