import { Command, CommandContext } from "../../../core/command/command.ts";
import { toggleInlineTag } from "./toggle-inline.ts";

export const ToggleBold: Command = {
  id: "toggleBold",
  execute(context?: CommandContext) {
    return toggleInlineTag("b", context);
  }
};
