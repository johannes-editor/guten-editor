/** @jsx h */
import { h, appendElementOnOverlayArea, t } from "../../index.ts";
import { Command, CommandContext } from "../../../core/command/command.ts";
import { BlockOptions } from "../components/block-options.tsx";
import { ArrowDownIcon, ArrowUpIcon, ChatLeftIcon, CopyIcon, TrashIcon } from "../../../design-system/components/icons.tsx";
import { BlockOptionsItem } from "../components/block-options-item.tsx";

export const OpenBlockOptions: Command = {
    id: "openBlockOptions",
    shortcut: { chord: "Mod+Shift+O", description: "Open block options" },
    execute(ctx: CommandContext<{ block?: HTMLElement; rect?: DOMRect }>): boolean {

        const el = appendElementOnOverlayArea(
            <BlockOptions >
                <BlockOptionsItem icon={<CopyIcon />} label={t("duplicate")} />
                <BlockOptionsItem icon={<ArrowUpIcon />} label={t("move_up")} />
                <BlockOptionsItem icon={<ArrowDownIcon />} label={t("move_down")} />
                <BlockOptionsItem icon={<ChatLeftIcon />} label={t("comment")} />
                <BlockOptionsItem icon={<TrashIcon />} label={t("delete")} />
            </BlockOptions>
        );

        const rect = ctx.content?.rect;
        if (rect) {
            el.style.top = `${rect.top}px`;
            el.style.left = `${rect.right + 8}px`;
        }

        return true;
    }
};