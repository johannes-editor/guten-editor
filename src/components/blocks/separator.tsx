import { DefaultProps } from "@core/components";

export function SeparatorBlock(props: DefaultProps) : HTMLElement{
    return (
        <hr
            className="block block-separator"
            contentEditable="false"
            {...props}
        />
    );
}