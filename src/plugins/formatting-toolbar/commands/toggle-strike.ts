import { Command, CommandContext } from "../../../core/command/command.ts";
import { toggleInlineTag } from "./toggle-inline.ts";

export const ToggleStrike: Command = {
  id: "toggleStrike",
  execute(context?: CommandContext) {
    return toggleInlineTag("s", context);
  }
};
