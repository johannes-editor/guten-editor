import { Command } from "@core/command";
import { CommandExtensionPlugin } from "@plugin/commands";
import { InsertEquation } from "../commands/insert-equation.ts";
import { OpenEquationPopover } from "../commands/open-math-popover.tsx";

/**
 * Command extension that registers equation-related commands.
 * Registers:
 *  - OpenEquationPopover: opens the equation (KaTeX) input popover.
 *  - InsertEquation: inserts a rendered equation at the current selection.
 */
export class CommandEquationExtension extends CommandExtensionPlugin {
    /**
    * Returns the commands provided by this extension.
    * @returns {Command[]} [OpenEquationPopover, InsertEquation]
    */
    override commands(): Command | Command[] {
        return [OpenEquationPopover, InsertEquation];
    }
}
