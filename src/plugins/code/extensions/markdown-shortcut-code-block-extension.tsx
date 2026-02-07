import { runCommand } from "@core/command/index.ts";
import { MarkdownShortcutContext, MarkdownShortcutRule, MarkdownShortcutExtensionPlugin } from "@plugin/markdown-shortcuts/index.ts";

export class MarkdownShortcutCodeBlockExtension extends MarkdownShortcutExtensionPlugin {

    override shortcuts(): MarkdownShortcutRule[] {
        return [
            {
                pattern: "```",
                trigger: "space",
                sort: 95,
                onMatch: (context) => this.insertCodeBlock(context),
            },
        ];
    }

    private insertCodeBlock(context: MarkdownShortcutContext) {
        const text = context.afterText.trimStart();
        runCommand("insertCodeBlock", {
            content: {
                afterBlock: context.block,
                instruction: text ? { content: text } : undefined,
            },
        });
    }
}