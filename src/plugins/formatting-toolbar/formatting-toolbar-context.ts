import { createContext } from "../../core/context/context.ts";

export interface FormattingToolbarContext {
  lock(): void;
  unlock(): void;
}

export const FormattingToolbarCtx = createContext<FormattingToolbarContext>("FormattingToolbarContext");