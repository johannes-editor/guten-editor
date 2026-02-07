import { Command, CommandContext } from "@core/command/command.ts";

export const ToggleItalic: Command = {
  id: "toggleItalic",
  shortcut: { chord: "Mod+I", description: "Toggle italic formatting" },
  execute(_context?: CommandContext) {
    return document.execCommand("italic");
  }
};