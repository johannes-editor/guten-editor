/** @jsx h */
import { h } from "../../jsx.ts";
import { ModalButtonUI } from "./components/modal-button-ui.tsx";
import { Plugin } from "../../core/plugin-engine/plugin.ts";

export class ModalButtonPlugin extends Plugin{
    override setup(root: HTMLElement): void {
      throw new Error("Method not implemented.");

    }
}