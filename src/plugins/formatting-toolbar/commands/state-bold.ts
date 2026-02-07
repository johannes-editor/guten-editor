import { Command, CommandContext } from "@core/command";

export const StateBold: Command = {
  id: "stateBold",
  execute(_context?: CommandContext) {
    return document.queryCommandState("bold");
  }
};