
/** A keyboard shortcut chord, e.g. "Mod+K", "Mod+Slash". */
export type KeyChord = string;

/** Definition of a keyboard shortcut. */
export type ShortcutDef = {

    /** The chord to listen for (e.g. "Mod+K"). */
    chord: KeyChord;

    /**
    * Optional guard. If provided, it must return true for the shortcut to fire.
    * Receives the original keyboard event.
    */
    when?: (ctx: { event: KeyboardEvent }) => boolean;

    /** Whether to call event.preventDefault(). Defaults to true. */
    preventDefault?: boolean;

    /** Short, user-facing description (e.g., for a help modal). */
    description?: string;

    /** Priority used to break ties when multiple shortcuts match. Higher wins. */
    priority?: number;
};

/**
 * Context passed to commands when they execute.
 * @template TContext - Type of the arbitrary payload available as `content`.
 */
export interface CommandContext<TContext = unknown> {

    /** Optional root element that scopes the command. */
    root?: HTMLElement;

    /** Current DOM Selection, if any. */
    selection?: Selection;

    /** Source event that triggered the command (keyboard, click, etc.). */
    event?: Event;

    /** Original event target (type left open by design). */
    // deno-lint-ignore no-explicit-any
    target?: any;

    /** Arbitrary payload for the command (text, math object, JSON, etc.). */
    content?: TContext;
}

/**
 * A single executable command, optionally bound to shortcut(s).
 * @template TContext - Payload type expected in `CommandContext.content`.
 */
export interface Command<TContext = unknown> {

    /** Unique command identifier. */
    id: string;

    /**
    * Execute the command with an optional context.
    * @param context Optional command context.
    * @returns true if the command handled the action; otherwise false.
    */
    execute(context?: CommandContext<TContext>): boolean;

    /** One or more keyboard shortcuts that trigger this command. */
    shortcut?: ShortcutDef | ShortcutDef[];
}

/**
 * Registry that stores and runs commands by id.
 * Note: the registry is heterogeneous; per-command payload types are not enforced at runtime.
 */
export class CommandRegistry {

    /** Internal map of command id → command. */
    // deno-lint-ignore no-explicit-any
    private map = new Map<string, Command<any>>();

    /**
    * Register (or replace) a command by its id.
    * @param cmd The command to register.
    */
    register<T>(cmd: Command<T>) { this.map.set(cmd.id, cmd); }

    /**
    * Run a command by id.
    * @param id Command identifier.
    * @param context Optional context passed to the command.
    * @returns The command's boolean result, or false if not found.
    */
    // deno-lint-ignore no-explicit-any
    run(id: string, context?: CommandContext<any>) { return this.map.get(id)?.execute(context) ?? false; }
}
