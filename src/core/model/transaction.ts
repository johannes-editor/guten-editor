import { DocumentModel } from "./document-model.ts";

export interface Transaction {
    do(model: DocumentModel): void;
    undo?(model: DocumentModel): void;
}

/**
 * Basic transaction manager with undo/redo stacks.
 */
export class TransactionManager {
    private undoStack: Transaction[] = [];
    private redoStack: Transaction[] = [];

    apply(tx: Transaction, model: DocumentModel) {
        tx.do(model);
        this.undoStack.push(tx);
        this.redoStack.length = 0;
    }

    undo(model: DocumentModel) {
        const tx = this.undoStack.pop();
        if (tx && tx.undo) {
            tx.undo(model);
            this.redoStack.push(tx);
        }
    }

    redo(model: DocumentModel) {
        const tx = this.redoStack.pop();
        if (tx) {
            tx.do(model);
            this.undoStack.push(tx);
        }
    }

    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }
}
