import { Plugin } from "../../plugins/index.ts";

export interface CommandContext {
    root?: HTMLElement;
    selection?: Selection;
    url?: string;
    event?: Event;
    // deno-lint-ignore no-explicit-any
    target?: any;
    latex?: string;
    displayMode?: boolean;
}

export interface Command {
    id: string;
    execute(context?: CommandContext): boolean;
}

export class CommandRegistry {
    private map = new Map<string, Command>();
    register(cmd: Command) { this.map.set(cmd.id, cmd); }
    run(id: string, context?: CommandContext) { return this.map.get(id)?.execute(context) ?? false; }
}
