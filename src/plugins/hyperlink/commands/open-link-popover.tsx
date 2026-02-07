/** @jsx h */

import { h } from "@core/jsx/index.ts";
import { t } from "@core/i18n/index.ts";
import { Command } from "@core/command/command.ts";
import { InputTypes } from "@utils/dom/index.ts";
import { hasSelection } from "@utils/selection/index.ts";
import { appendElementOnOverlayArea } from "@components/editor/core/index.tsx";
import { LinkPopover } from "../components/link-popover.tsx";

/**
 * Command: opens the Link popover overlay (URL input).
 *
 * - Appends a small UI to capture a URL from the user.
 * - Typically followed by the `createLink` command.
 */
export const OpenLinkPopover: Command = {

    id: "openLinkPopover",
    shortcut: { chord: "Mod+K", description: "Insert/edit link", when: () => hasSelection(), preventDefault: true },
    execute(): boolean {

        appendElementOnOverlayArea(<LinkPopover inputType={InputTypes.Url} inputPlaceholder={t("paste_or_type_a_link")} />);

        return true;
    }
};