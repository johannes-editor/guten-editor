import { CommandExtensionPlugin } from "../commands/command-plugin.ts";
import { Command } from "../index.ts";
import { CreateLink } from "./commands/create-link.ts";
import { OpenLinkPopover } from "./commands/open-link-popover.tsx";

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
        return [CreateLink, OpenLinkPopover];
    }
}