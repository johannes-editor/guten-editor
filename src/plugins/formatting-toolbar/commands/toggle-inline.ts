import { CommandContext } from "../../../core/command/command.ts";
import { Transaction } from "../../../core/model/transaction.ts";
import { Editor } from "../../../components/editor/editor.tsx";

/**
 * Toggle an inline element around the current selection.
 * Instead of manipulating the DOM directly, this function mutates the
 * in-memory DocumentModel via a transaction and then re-renders the DOM
 * through the Editor component.
 */
export function toggleInlineTag(tag: string, context?: CommandContext): boolean {
  const selection = context?.selection || window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);
  if (range.collapsed) return false;

  const editor = context?.root as unknown as Editor | undefined;
  if (!editor) return false;
  const contentArea = editor.querySelector<HTMLElement>("#contentArea");
  if (!contentArea) return false;

  // Find the block element that contains the selection
  let blockEl: Node | null = range.commonAncestorContainer;
  while (blockEl && blockEl !== contentArea && !(blockEl instanceof HTMLElement && blockEl.parentElement === contentArea)) {
    blockEl = blockEl.parentNode;
  }
  if (!(blockEl instanceof HTMLElement)) return false;

  const blockIndex = Array.from(contentArea.children).indexOf(blockEl);
  if (blockIndex === -1) return false;

  // Compute text offsets within the block ignoring markup
  const start = getTextOffset(blockEl, range.startContainer, range.startOffset);
  const end = getTextOffset(blockEl, range.endContainer, range.endOffset);
  if (start === end) return false;

  let previousMarks: import("../../../core/model/document-model.ts").Mark[] | undefined;
  const tx: Transaction = {
    do(model) {
      const block = model.blocks[blockIndex];
      previousMarks = block.marks ? block.marks.map(m => ({ ...m })) : [];
      block.marks = previousMarks.slice();
      const idx = block.marks.findIndex(m => m.tag === tag && m.start <= start && m.end >= end);
      if (idx >= 0) {
        block.marks.splice(idx, 1); // unwrap
      } else {
        block.marks.push({ tag, start, end });
      }
    },
    undo(model) {
      const block = model.blocks[blockIndex];
      block.marks = previousMarks;
    }
  };

  editor.applyTransaction(tx);
  return true;
}

function getTextOffset(block: HTMLElement, node: Node, offset: number): number {
  const range = document.createRange();
  range.setStart(block, 0);
  range.setEnd(node, offset);
  return range.toString().length;
}

