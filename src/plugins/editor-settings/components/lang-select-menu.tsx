/** @jsx h */
import { h, MenuItemUI, t, type DefaultProps } from "../../index.ts";
import type { OverlayCtor } from "../../../components/overlay/overlay-component.tsx";
import { EditorSettingsMenu } from "./editor-settings-menu.tsx";
import { NavigationMenu } from "../../../design-system/components/navigation-menu.tsx";
import { LocaleMeta } from "../../../core/i18n/index.ts";

interface LangSelectItemProps extends DefaultProps {
    label: string;
    value: string;
    activeLocale: string;
    onSelectLocale: (locale: string) => void;
}

class LangSelectItem extends MenuItemUI<LangSelectItemProps> {
    override connectedCallback(): void {
        this.label = this.props.label;
        super.connectedCallback();
    }

    override isActive(): boolean {
        return this.props.activeLocale === this.props.value;
    }

    override onSelect(): void {
        this.props.onSelectLocale(this.props.value);
    }
}

export interface LangSelectMenuProps extends DefaultProps {
    anchor: HTMLElement;
    locales: LocaleMeta[];
    activeLocale: string;
    onLocaleSelect: (locale: string) => void;
}

export class LangSelectMenu extends NavigationMenu<LangSelectMenuProps> {
    override canOverlayClasses: ReadonlySet<OverlayCtor> = new Set<OverlayCtor>([EditorSettingsMenu]);
    protected override positionMode: "none" | "relative" | "anchor" = "relative";
    protected override lockWidthOnOpen = true;

    private formatLocaleLabel(locale: LocaleMeta): string {
        if (!locale.name || locale.name === locale.nativeName) {
            return locale.nativeName || locale.code;
        }
        return `${locale.nativeName} (${locale.name})`;
    }

    private handleLocaleSelect = (locale: string) => {
        this.props.onLocaleSelect(locale);
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
                    <li>
                        <div class="guten-menu-label">{t('language')}</div>
                    </li>
                    {this.props.locales.map((locale) => (
                        <li>
                            <LangSelectItem
                                label={this.formatLocaleLabel(locale)}
                                value={locale.code}
                                activeLocale={this.props.activeLocale}
                                onSelectLocale={this.handleLocaleSelect}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}