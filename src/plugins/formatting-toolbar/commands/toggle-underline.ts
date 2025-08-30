import { Command, CommandContext } from "../../../core/command/command.ts";
import { toggleInlineTag } from "./toggle-inline.ts";

export const ToggleUnderline: Command = {
  id: "toggleUnderline",
  execute(context?: CommandContext) {
    return toggleInlineTag("u", context);
  }
};
