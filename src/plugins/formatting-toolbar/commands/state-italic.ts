import { Command, CommandContext } from "../../../core/command/command.ts";

export const StateItalic: Command = {
  id: "stateItalic",
  execute(_context?: CommandContext) {
    return document.queryCommandState("italic");
  }
};