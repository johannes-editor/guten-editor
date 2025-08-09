
export interface CommandContext {
  root: HTMLElement;
  selection: Selection;
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
