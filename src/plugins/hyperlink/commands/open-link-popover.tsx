/** @jsx h */

import { InputTypes } from "../../../constants/input-types.ts";
import { Command } from "../../../core/command/command.ts";
import { h, appendElementOnOverlayArea, t } from "../../index.ts";
import { LinkPopover } from "../components/link-popover.tsx";

/**
 * Command: opens the Link popover overlay (URL input).
 *
 * - Appends a small UI to capture a URL from the user.
 * - Typically followed by the `createLink` command.
 */
export const OpenLinkPopover: Command = {

    id: "openLinkPopover",
    execute(): boolean {

        appendElementOnOverlayArea(<LinkPopover inputType={InputTypes.Url} inputPlaceholder={t("paste_or_type_a_link")} />);

        return true;
    }
};