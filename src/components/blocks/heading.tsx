import { t } from "@core/i18n";
import { DefaultProps } from "@core/components";
import { generateBlockId } from "@utils/dom";

export function Heading1Block(props: DefaultProps): HTMLHeadingElement {
    return (
        <h1
            data-block-id={generateBlockId()}
            className={`block guten-placeholder ${!props.children && "empty"}`}
            data-placeholder={t("heading_1")}
            data-placeholder-key="heading_1"
            {...props}
        >
            {props.children ?? <br />}
        </h1>
    );
}

export function Heading2Block(props: DefaultProps): HTMLHeadingElement {
    return (
        <h2
            data-block-id={generateBlockId()}
            className={`block guten-placeholder ${!props.children && "empty"}`}
            data-placeholder={t("heading_2")}
            data-placeholder-key="heading_2"
            {...props}
        >
            {props.children ?? <br />}
        </h2>
    );
}

export function Heading3Block(props: DefaultProps): HTMLHeadingElement {
    return (
        <h3
            data-block-id={generateBlockId()}
            className={`block guten-placeholder ${!props.children && "empty"}`}
            data-placeholder={t("heading_3")}
            data-placeholder-key="heading_3"
            {...props}
        >
            {props.children ?? <br />}
        </h3>
    );
}

export function Heading4Block(props: DefaultProps): HTMLHeadingElement {
    return (
        <h4
            data-block-id={generateBlockId()}
            className={`block guten-placeholder ${!props.children && "empty"}`}
            data-placeholder={t("heading_4")}
            data-placeholder-key="heading_4"
            {...props}
        >
            {props.children ?? <br />}
        </h4>
    );
}

export function Heading5Block(props: DefaultProps): HTMLHeadingElement {
    return (
        <h5
            data-block-id={generateBlockId()}
            className={`block guten-placeholder ${!props.children && "empty"}`}
            data-placeholder={t("heading_5")}
            data-placeholder-key="heading_5"
            {...props}
        >
            {props.children ?? <br />}
        </h5>
    );
}