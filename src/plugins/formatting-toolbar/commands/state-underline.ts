import { Command, CommandContext } from "@core/command";

export const StateUnderline: Command = {
  id: "stateUnderline",
  execute(_context?: CommandContext) {
    return document.queryCommandState("underline");
  }
};