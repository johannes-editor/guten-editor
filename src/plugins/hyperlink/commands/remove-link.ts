import { Command } from "../../../core/command/command.ts";

export const RemoveLink: Command = {
    id: "removeLink",
    execute(): boolean {
        requestAnimationFrame(() => {
            document.execCommand("unlink");
        });
        return true;
    },
};