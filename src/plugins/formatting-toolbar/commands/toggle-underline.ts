import { Command, CommandContext } from "../../../core/command/command.ts";

export const ToggleUnderline: Command = {
  id: "toggleUnderline",
  execute(_context?: CommandContext) {
    return document.execCommand("underline");
  }
};