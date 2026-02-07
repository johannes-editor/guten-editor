import { runCommand } from "@core/command/index.ts";
import { MarkdownShortcutContext, MarkdownShortcutRule } from "../types.ts";
import { MarkdownShortcutExtensionPlugin } from "../markdown-shortcuts-plugin.ts";

export class DefaultMarkdownShortcutsExtension extends MarkdownShortcutExtensionPlugin {
    override shortcuts(): MarkdownShortcutRule[] {
        return [
            this.createHeadingShortcut("#", "insertHeading1", 10),
            this.createHeadingShortcut("##", "insertHeading2", 20),
            this.createHeadingShortcut("###", "insertHeading3", 30),
            this.createHeadingShortcut("####", "insertHeading4", 40),
            this.createHeadingShortcut("#####", "insertHeading5", 50),
            this.createSimpleShortcut(">", "insertBlockquote", 60),
            this.createListShortcut("-", "insertBulletedList", 70),
            this.createListShortcut("1.", "insertNumberedList", 80),
            this.createSeparatorShortcut("---", 90),
        ];
    }

    private createHeadingShortcut(pattern: string, commandId: string, sort: number): MarkdownShortcutRule {
        return this.createTextCommandShortcut(pattern, commandId, sort);
    }

    private createSimpleShortcut(pattern: string, commandId: string, sort: number): MarkdownShortcutRule {
        return this.createTextCommandShortcut(pattern, commandId, sort);
    }

    private createSeparatorShortcut(pattern: string, sort: number): MarkdownShortcutRule {
        return {
            pattern,
            trigger: "space",
            sort,
            onMatch: (context) => {
                runCommand("insertSeparator", {
                    content: {
                        afterBlock: context.block,
                    },
                });
            },
        };
    }

    private createTextCommandShortcut(pattern: string, commandId: string, sort: number): MarkdownShortcutRule {
        return {
            pattern,
            trigger: "space",
            sort,
            onMatch: (context) => {
                const text = this.getRemainingText(context);
                runCommand(commandId, {
                    content: {
                        afterBlock: context.block,
                        instruction: { content: text },
                    },
                });
            },
        };
    }

    private createListShortcut(pattern: string, commandId: string, sort: number): MarkdownShortcutRule {
        return {
            pattern,
            trigger: "space",
            sort,
            onMatch: (context) => {
                const text = this.getRemainingText(context);
                runCommand(commandId, {
                    content: {
                        afterBlock: context.block,
                        instruction: text ? { items: [{ text }] } : undefined,
                    },
                });
            },
        };
    }

    private getRemainingText(context: MarkdownShortcutContext): string | undefined {
        const trimmed = context.afterText.trimStart();
        return trimmed.length > 0 ? trimmed : undefined;
    }
}