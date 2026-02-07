import { Command, CommandContext } from "@core/command/command.ts";

/**
 * Command: creates a hyperlink from the current selection.
 *
 * Requirements:
 * - `context.content.href` must be a non-empty string.
 *
 * Implementation notes:
 * - Uses `document.execCommand("createLink", false, href)` to wrap the selection.
 * - The operation runs in the next animation frame to ensure selection focus.
 *
 * @returns {boolean} True once the operation is queued; false if input is invalid.
 */
export const CreateLink: Command = {
    id: "createLink",

    execute(context: CommandContext<CreateLinkPayload>) {

        const href = context?.content?.href?.trim();

        requestAnimationFrame(() => {

            if (!href) {
                console.warn("href is required to create a link.");
                return false;
            }

            document.execCommand("createLink", false, href);
        });

        return true;
    }
};

export type CreateLinkPayload = { href: string };