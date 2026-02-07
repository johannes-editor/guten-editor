import { Command } from "@core/command";

export const RemoveLink: Command = {
    id: "removeLink",
    execute(): boolean {
        requestAnimationFrame(() => {
            document.execCommand("unlink");
        });
        return true;
    },
};