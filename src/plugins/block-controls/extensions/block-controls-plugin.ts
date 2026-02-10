import { Plugin } from "@core/plugin-engine";
import { DragManager } from "../drag-manager.tsx";

export class BlockControlsPlugin extends Plugin {

    private manager: DragManager | null = null;

    //Add Editor as parameter
    setup(root: HTMLElement, _plugins: Plugin[]): void {

        const content = root.querySelector('#contentArea') as HTMLElement | null;
        const overlay = root.querySelector('#overlayArea') as HTMLElement | null;

        if (content && overlay) {
            this.manager = new DragManager(content, overlay);
            this.manager.start();
        }
    }
}
