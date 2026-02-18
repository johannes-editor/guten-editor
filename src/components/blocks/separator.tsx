import { DefaultProps } from "@core/components";
import { generateBlockId } from "@utils/dom";

export function SeparatorBlock(props: DefaultProps): HTMLHRElement {
    return (
        <hr
            data-block-id={generateBlockId()}
            className="block block-separator"
            contentEditable="false"
            {...props}
        />
    );
}