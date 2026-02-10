import { Plugin } from "@core/plugin-engine";
import { DragAndDropManager } from "../drag-and-drop-manager.tsx";

export class DragAndDropPlugin extends Plugin {
    private manager: DragAndDropManager | null = null;

    //Add Editor as parameter
    setup(root: HTMLElement, _plugins: Plugin[]): void {

        const content = root.querySelector('#contentArea') as HTMLElement | null;
        const overlay = root.querySelector('#overlayArea') as HTMLElement | null;

        if (content && overlay) {
            this.manager = new DragAndDropManager(content, overlay);
            this.manager.start();
        }
    }
}
