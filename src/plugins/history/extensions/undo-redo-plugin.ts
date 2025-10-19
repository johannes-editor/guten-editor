import { Command } from "../../../core/command/command.ts";
import { Plugin } from "../../../core/plugin-engine/plugin.ts";
import { registerCommand } from "../../index.ts";
import { HistoryManager } from "../utils/history-manager.ts";

const historyManager = new HistoryManager();

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







