import { Command, CommandContext } from "@core/command/command.ts";

export const StateStrike: Command = {
  id: "stateStrike",
  execute(_context?: CommandContext) {
    return document.queryCommandState("strikeThrough");
  }
};