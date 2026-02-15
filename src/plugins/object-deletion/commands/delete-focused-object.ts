import { Command } from "@core/command";
import { clearFocusedObject, getFocusedObject, removeObjectAndCleanupBlock } from "../object-deletion-utils.ts";

export const DeleteFocusedObjectCommand: Command = {
    id: "deleteFocusedObject",
    execute(): boolean {
        const target = getFocusedObject();
        if (!target) return false;

        clearFocusedObject();
        return removeObjectAndCleanupBlock(target);
    },
};