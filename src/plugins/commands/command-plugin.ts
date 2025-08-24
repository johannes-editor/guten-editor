
import { keyboard } from "../../utils/index.ts";

import { ShortcutDef } from "../../core/command/command.ts";
import { Command, ExtensiblePlugin, Plugin, PluginExtension, registerCommand, runCommand } from "../index.ts";

type Binding = { cmdId: string; def: ShortcutDef };

/**
 * Hosts command extensions. On initialization, it gathers commands from all
 * extensions and registers them into the global command registry.
 *
 * Responsibilities:
 * - Listen to `keydown` globally and translate events into normalized chords.
 * - Match chords against registered shortcut definitions (with optional guards).
 * - Run the winning command (highest priority among matches).
 */
export class CommandPlugin extends ExtensiblePlugin<CommandExtensionPlugin> {

    /** Map of normalized chord → ordered bindings (highest priority first). */
    private bindings = new Map<string, Binding[]>();

    /** Keydown listener bound to the instance. */
    private keyHandler = (ev: KeyboardEvent) => this.onKey(ev);

    /** Attach global keydown handler when the plugin is set up. */
    override setup(_root: HTMLElement, _plugins: Plugin[]): void {
        document.addEventListener("keydown", this.keyHandler);
    }

    /**
    * Initializes the host by registering all commands provided by extensions.
    * Each extension may return a single command or an array of commands.
    *
    * Note: commands are heterogeneous (their `TContext` payloads may differ).
    * Typing as `any[]` keeps the host agnostic to specific payloads.
    */
    // deno-lint-ignore no-explicit-any
    override attachExtensions(extensions: any[]): void {
        for (const ext of extensions) {
            const defs = ext.commands?.();
            const list: Command[] = Array.isArray(defs) ? defs : defs ? [defs] : [];
            for (const cmd of list) {
                registerCommand(cmd);
                const shortcuts = Array.isArray(cmd.shortcut) ? cmd.shortcut : cmd.shortcut ? [cmd.shortcut] : [];
                for (const sc of shortcuts) this.registerShortcut(sc, cmd.id);
            }
        }
    }

    /**
    * Register a shortcut binding for a given command id.
    * Ensures bindings for the same chord are kept in descending priority.
    */
    private registerShortcut(def: ShortcutDef, cmdId: string) {
        const chord = keyboard.normalizeChord(def.chord);
        const arr = this.bindings.get(chord) ?? [];
        arr.push({ cmdId, def });
        arr.sort((a, b) => (b.def.priority ?? 0) - (a.def.priority ?? 0)); // maior prioridade primeiro
        this.bindings.set(chord, arr);
    }

    /**
    * Handle a keydown event:
    * - Build the chord from the event
    * - Find the first binding whose `when` guard (if any) returns true
    * - Prevent default unless `preventDefault === false`
    * - Run the associated command with a minimal context (`{ event }`)
    */
    private onKey(ev: KeyboardEvent) {
        // Example: ignore inputs/textarea or contenteditable outside the editor root
        // if (isTextInput(ev.target as Element)) return;

        const chord = keyboard.eventToChord(ev);
        const list = this.bindings.get(chord);
        if (!list?.length) return;

        const hit = list.find(b => !b.def.when || b.def.when({ event: ev }));
        if (!hit) return;

        if (hit.def.preventDefault !== false) {
            ev.preventDefault();
            ev.stopPropagation();
        }

        // Minimal context; commands that need more can use `content` in their own flows.
        runCommand(hit.cmdId, { event: ev });
    }
}

/**
 * Base class for command extensions. Implement `commands()` to return one or
 * more `Command` objects. The host (`CommandPlugin`) will register them.
 *
 * Expected Command shape (with generics):
 * - `id: string`
 * - `execute(context?: CommandContext<T>): boolean`
 * - `shortcut?: ShortcutDef | ShortcutDef[]`
 *
 * Where `T` is the payload type available at `context.content`.
 */
export abstract class CommandExtensionPlugin extends PluginExtension<CommandPlugin> {
    override readonly target = CommandPlugin;

    /** Return one or many commands to be registered by the host. */
    abstract commands(): Command | Command[];
}