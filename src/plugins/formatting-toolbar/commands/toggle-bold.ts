import { Command, CommandContext } from "@core/command";

export const ToggleBold: Command = {
  id: "toggleBold",
  shortcut: { chord: "Mod+B", description: "Toggle bold formatting" },
  execute(_context?: CommandContext) {
    return document.execCommand("bold");
  }
};