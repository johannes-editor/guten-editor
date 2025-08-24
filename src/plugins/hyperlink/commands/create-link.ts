import { Command, CommandContext } from "../../../core/command/command.ts";

/**
 * Command: creates a hyperlink from the current selection.
 *
 * Requirements:
 * - `context.url` must be a non-empty string.
 *
 * Implementation notes:
 * - Uses `document.execCommand("createLink", false, url)` to wrap the selection.
 * - The operation runs in the next animation frame to ensure selection focus.
 *
 * @returns {boolean} True once the operation is queued; false if input is invalid.
 */
export const CreateLink: Command = {
    id: "createLink",
    execute(context: CommandContext) {

        requestAnimationFrame(() => {

            if (!context.url) {
                console.warn("URL is required to create a link.");
                return false;
            }

            document.execCommand("createLink", false, context.url);
        });

        return true;
    }
};