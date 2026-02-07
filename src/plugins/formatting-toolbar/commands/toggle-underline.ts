import { Command, CommandContext } from "@core/command/command.ts";

export const ToggleUnderline: Command = {
  id: "toggleUnderline",
  shortcut: { chord: "Mod+U", description: "Toggle underline formatting" },
  execute(_context?: CommandContext) {
    return document.execCommand("underline");
  }
};