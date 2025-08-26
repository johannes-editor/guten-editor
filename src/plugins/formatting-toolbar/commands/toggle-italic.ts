import { Command, CommandContext } from "../../../core/command/command.ts";
import { toggleInlineTag } from "./toggle-inline.ts";

export const ToggleItalic: Command = {
  id: "toggleItalic",
  execute(context?: CommandContext) {
    return toggleInlineTag("em", context);
  }
};
