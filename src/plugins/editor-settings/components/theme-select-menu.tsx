/** @jsx h */
import { h, MenuItemUI, t, type DefaultProps } from "../../index.ts";
import type { OverlayCtor } from "../../../components/overlay/overlay-component.tsx";
import { EditorSettingsMenu } from "./editor-settings-menu.tsx";
import { NavigationMenu } from "../../../design-system/components/navigation-menu.tsx";

interface ThemeSelectItemProps extends DefaultProps {
    label: string;
    value: string;
    activeTheme: string;
    onSelectTheme: (theme: string) => void;
}

class ThemeSelectItem extends MenuItemUI<ThemeSelectItemProps> {
    override connectedCallback(): void {
        this.label = this.props.label;
        super.connectedCallback();
    }

    override isActive(): boolean {
        return this.props.activeTheme === this.props.value;
    }

    override onSelect(): void {
        this.props.onSelectTheme(this.props.value);
    }
}

export interface ThemeSelectMenuProps extends DefaultProps {
    anchor: HTMLElement;
    themes: string[];
    activeTheme: string;
    onThemeSelect: (theme: string) => void;
}

export class ThemeSelectMenu extends NavigationMenu<ThemeSelectMenuProps> {
    override canOverlayClasses: ReadonlySet<OverlayCtor> = new Set<OverlayCtor>([EditorSettingsMenu]);
    protected override positionMode: "none" | "relative" | "anchor" = "relative";
    protected override lockWidthOnOpen = true;

    private formatThemeLabel(theme: string): string {
        if (theme === "auto") return "Auto";
        return theme
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
    }

    private handleThemeSelect = (theme: string) => {
        this.props.onThemeSelect(theme);
    };

    override afterRender(): void {

        super.afterRender();

        const anchor = this.props.anchor;

        if (anchor) {
            requestAnimationFrame(

                () => this.positionRelativeToMenu(anchor));
        }
    }

    override render() {
        return (
            <div class="guten-menu">
                <ul>
                    {/* <li>
                        <div class="guten-menu-label">{t('theme')}</div>
                    </li> */}
                    {this.props.themes.map((theme) => (
                        <li>
                            <ThemeSelectItem
                                label={this.formatThemeLabel(theme)}
                                value={theme}
                                activeTheme={this.props.activeTheme}
                                onSelectTheme={this.handleThemeSelect}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}