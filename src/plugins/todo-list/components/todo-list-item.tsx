import { t } from "@core/i18n";

export function TodoListItem(): HTMLLIElement {
    return (
        <li>
            <input type="checkbox" />
            <span
                contenteditable="true"
                data-placeholder={t("list_item")}
                data-placeholder-key="list_item"
                className="guten-placeholder empty"
            >
                <br />
            </span>
        </li>
    );
}