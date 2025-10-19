import { Command } from "../../../core/command/command.ts";
import { CommandExtensionPlugin } from "../../commands/command-plugin.ts";
import { HistoryManager } from "../utils/history-manager.ts";

const historyManager = new HistoryManager();

export class UndoRedoCommandExtension extends CommandExtensionPlugin {
    override commands(): Command | Command[] {
        return [
            {
                id: "editor.undo",
                execute: () => {

                    console.log("undo called");
                    return historyManager.undo();
                },
                shortcut: { chord: "Mod+Z" },
            },
            {
                id: "editor.redo",
                execute: () => {
                    console.log("redo called");
                    return historyManager.redo()
                },
                shortcut: [
                    { chord: "Shift+Mod+Z" },
                    { chord: "Mod+Y" },
                ],
            },
        ];
    }

    /**
     *
     */
    constructor() {
        super();
        console.log("UndoRedoCommandExtension");
    }
}