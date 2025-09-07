/** @jsx h */
import { h, appendElementOnOverlayArea, t, runCommand } from "../../index.ts";
import { Command, CommandContext } from "../../../core/command/command.ts";
import { BlockOptions } from "../components/block-options.tsx";
import { ArrowDownIcon, ArrowUpIcon, ChatLeftIcon, CopyIcon, TrashIcon } from "../../../design-system/components/icons.tsx";
import { BlockOptionsItem } from "../components/block-options-item.tsx";

export const OpenBlockOptions: Command = {
    id: "openBlockOptions",
    shortcut: { chord: "Mod+Shift+O", description: "Open block options" },
    execute(context: CommandContext<{ block?: HTMLElement; rect?: DOMRect }>): boolean {


        let blockOptions: HTMLElement | null = null;

        const el = appendElementOnOverlayArea(
            <BlockOptions >
                <BlockOptionsItem icon={<CopyIcon />} label={t("duplicate")} onSelect={() => runCommand("duplicateBlock", {
                    content: { block: context.content?.block, blockOptions: blockOptions }
                })} />

                <BlockOptionsItem icon={<ArrowUpIcon />} label={t("move_up")} onSelect={() => runCommand("moveBlockUp", {
                    content: { block: context.content?.block, blockOptions: blockOptions }
                })} />

                <BlockOptionsItem icon={<ArrowDownIcon />} label={t("move_down")} onSelect={() => runCommand("moveBlockDown", {
                    content: { block: context.content?.block, blockOptions: blockOptions }
                })} />

                <BlockOptionsItem icon={<TrashIcon />} label={t("delete")} onSelect={() => runCommand("deleteBlock", {
                    content: { block: context.content?.block, blockOptions: blockOptions }
                })} />

            </BlockOptions>
        );

        blockOptions = el;

        const rect = context.content?.rect;
        if (rect) {
            el.style.top = `${rect.top}px`;
            el.style.left = `${rect.right + 8}px`;
        }

        return true;
    }
};