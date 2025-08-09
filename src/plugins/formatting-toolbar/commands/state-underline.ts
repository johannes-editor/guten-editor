import { Command, CommandContext } from "../../../core/command/command.ts";

export const StateUnderline: Command = {
  id: "stateUnderline",
  execute(_context?: CommandContext) {
    return document.queryCommandState("underline");
  }
};