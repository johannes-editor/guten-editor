import { Command } from "../../../core/command/command.ts";
import { Plugin } from "../../../core/plugin-engine/plugin.ts";
import { registerCommand } from "../../index.ts";
import { historyManager } from "../utils/history-manager-instance.ts";



export class UndoRedoPlugin extends Plugin {
    
    override setup(root: HTMLElement): void {
        historyManager.attach(root);
        this.registerFallbackCommands();
    }

    private registerFallbackCommands() {
        const commands: Command[] = [
            {
                id: "editor.undo",
                execute: () => historyManager.undo(),
            },
            {
                id: "editor.redo",
                execute: () => historyManager.redo(),
            },
        ];

        for (const cmd of commands) registerCommand(cmd);
    }


    constructor() {
        super();
        console.log("UndoRedoPlugin");
    }
}