import { Command } from "@core/command";
import { CommandExtensionPlugin } from "@plugins/commands";
import { CreateLink } from "./commands/create-link.ts";
import { OpenLinkPopover } from "./commands/open-link-popover.tsx";
import { RemoveLink } from "./commands/remove-link.ts";

/**
 * Command extension that registers hyperlink-related commands.
 *
 * Registers:
 *  - OpenLinkPopover — shows the URL input popover.
 *  - CreateLink — wraps current selection with an anchor to the given URL.
 */
export class CommandHyperlinkExtensionPlugin extends CommandExtensionPlugin {

    /** Returns the commands contributed by this extension. */
    override commands(): Command | Command[] {
        return [CreateLink, RemoveLink, OpenLinkPopover];
    }
}