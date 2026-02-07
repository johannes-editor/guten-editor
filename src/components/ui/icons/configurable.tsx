/**@jsx h */

import { h } from "@core/jsx";
import { IconProps } from "./types.ts";

export const SwatchRoundedIcon = ({
    color = "currentColor",
    strokeColor = "none",
    strokeWidth = 1,
    size = 18,
    ...svgProps
}: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 18 18"
        width={size}
        height={size}
        {...svgProps}
    >
        <circle cx="9" cy="9" r="8" fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
    </svg>
);


export const SwatchIcon = ({
    color = "currentColor",
    strokeColor = "none",
    strokeWidth = 1,
    size = 18,
    ...svgProps
}: IconProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 18 18"
        width={size}
        height={size}
        {...svgProps}
    >
        <rect x="1" y="1" width="16" height="16" rx="4" fill={color} stroke={strokeColor} strokeWidth={strokeWidth} />
    </svg>
);