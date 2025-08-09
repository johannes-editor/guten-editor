import { Command, CommandContext } from "../../../core/command/command.ts";

export const ToggleBold: Command = {
  id: "toggleBold",
  execute(_context?: CommandContext) {
    return document.execCommand("bold");
  }
};