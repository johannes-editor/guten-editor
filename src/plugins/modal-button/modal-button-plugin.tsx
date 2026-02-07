/** @jsx h */
import { h } from "@core/jsx";
import { ModalButtonUI } from "./components/modal-button-ui.tsx";
import { Plugin } from "../../core/plugin-engine/plugin.ts";

export class ModalButtonPlugin extends Plugin{
    override setup(root: HTMLElement): void {
      throw new Error("Method not implemented.");

    }
}