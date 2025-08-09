import { Command, CommandContext } from "../../../core/command/command.ts";

export const ToggleItalic: Command = {
  id: "toggleItalic",
  execute(_context?: CommandContext) {
    return document.execCommand("italic");
  }
};