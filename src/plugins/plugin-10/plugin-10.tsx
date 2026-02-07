/** @jsx h */
import { h } from "@core/jsx/index.ts";
import { Plugin } from "@core/plugin-engine/plugin.ts";
import { Button10 } from "./button-10.tsx";

export class Plugin10 extends Plugin {

    override setup(root: HTMLElement): void {
        
        root.appendChild(
            <Button10 />
        );
    }
}