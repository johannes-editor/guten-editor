import { Command, CommandContext, CommandRegistry } from "./command.ts";

export const commandRegistry = new CommandRegistry();

export const registerCommand = (cmd: Command) => commandRegistry.register(cmd);
export const runCommand = (id: string, context?: CommandContext) => commandRegistry.run(id, context); 

export * from "./command.ts";
export * from "./types.ts";