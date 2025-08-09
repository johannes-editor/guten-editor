
import { Command, ExtensiblePlugin, PluginExtension, registerCommand } from "../index.ts";

/**
 * Host for command extensions. On initialize, it collects commands from all
 * extensions and registers them into the global registry (gutenCommand).
 */
export class CommandPlugin extends ExtensiblePlugin<CommandExtensionPlugin> {

    /**
    * Initializes the host by registering all commands provided by extensions.
    * @param extensions - List of command-providing extensions.
    */
    override attachExtensions(extensions: CommandExtensionPlugin[]): void {

        for (const ext of extensions) {
            const defs = ext.commands();
            const list = Array.isArray(defs) ? defs : [defs];
            for (const cmd of list) registerCommand(cmd);
        }
    }
}

/**
 * Base class for command extensions. Implement `commands()` to return one or
 * more `Command` objects. The host (`CommandPlugin`) will register them.
 *
 * Expected `Command` shape:
 * - `id: string`
 * - `execute(context?: { root: HTMLElement; selection: Selection }): boolean`
 */
export abstract class CommandExtensionPlugin extends PluginExtension<CommandPlugin> {
    override readonly target = CommandPlugin;

    /**
    * Returns one or many commands to be registered by the host.
    */
    abstract commands(): Command | Command[];
}