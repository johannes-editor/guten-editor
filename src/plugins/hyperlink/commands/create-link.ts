import { Command, CommandContext } from "../../../core/command/command.ts";

/**
 * Command: creates a hyperlink from the current selection.
 * Requires a non-empty `href` in the context content.
 */
export const CreateLink: Command = {
  id: "createLink",

  execute(context: CommandContext<CreateLinkPayload>) {
    const href = context?.content?.href?.trim();
    if (!href) {
      console.warn("href is required to create a link.");
      return false;
    }

    const selection = context.selection || window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;
    const range = selection.getRangeAt(0);
    if (range.collapsed) return false;

    const anchor = document.createElement("a");
    anchor.href = href;
    try {
      range.surroundContents(anchor);
    } catch {
      return false;
    }

    context.root?.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }
};

export type CreateLinkPayload = { href: string };
