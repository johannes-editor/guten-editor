# Text Color Plugin

The **Text Color Plugin** extends the editor’s formatting toolbar with controls for text and highlight colors.  
It introduces a new toolbar button that opens a dedicated color menu, allowing users to apply both **foreground** and **background (highlight)** colors to their text selections.

---

## Features

- Adds a **Text Color** button to the formatting toolbar.
- Opens a **color picker menu** that lists:
  - Foreground colors (text color)
  - Background colors (highlight color)

---

## Architecture

The plugin is built using two extensible components:

### 1. `FormattingToolbarTextColorExtension`
Extends the `FormattingToolbar` plugin by registering a new button.
- When clicked, it runs the `openTextColorMenu` command.
- The command opens a menu overlay positioned relative to the toolbar button.
- The menu allows users to select from predefined color options.

### 2. `CommandTextColorExtension`
Registers commands that other plugins or components can use:
- **`openTextColorMenu`** — Opens the text color selection menu.
- **`setTextColor`** — Applies a foreground (text) color.
- **`setHighlightColor`** — Applies a background (highlight) color.

---

## Menu Component

The menu (`TextColorMenu`) renders two sections:
1. **Text Color** — Foreground color options.
2. **Highlight Color** — Background color options.

Each item (`TextColorMenuItem`) represents a color swatch and visually indicates the current selection.

When a color is selected, the menu executes:
```ts
runCommand("setTextColor", { content: { color: "#ff0000" } });