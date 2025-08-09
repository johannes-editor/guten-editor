import { Command, CommandContext } from "../../../core/command/command.ts";

export const ToggleStrike: Command = {
  id: "toggleStrike",
  execute(_context?: CommandContext) {
    return document.execCommand("strikeThrough");
  }
};