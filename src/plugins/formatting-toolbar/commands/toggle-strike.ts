import { Command, CommandContext } from "@core/command/command.ts";

export const ToggleStrike: Command = {
  id: "toggleStrike",
  shortcut: { chord: "Mod+Shift+X", description: "Toggle strikethrough formatting" },
  execute(_context?: CommandContext) {
    return document.execCommand("strikeThrough");
  }
};