import React from "react";

import BaseIcons from "@/shared/resources/constants/BaseIcons";

import { IconsMap } from "./Icon.consts";

import type { IconProps } from "./types";

const DEFAULT_SIZE = 24;

const IconPlaceholder: React.FC<{ size?: number }> = ({
  size = DEFAULT_SIZE,
}) => (
  <div
    className="bg-transparent rounded flex items-center justify-center"
    style={{ width: size, height: size }}
  >
    <span className="text-gray-500 opacity-60 text-sm"></span>
  </div>
);

function filterUndefinedProps<T extends object>(props: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(props).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  ) as Partial<T>;
}

const Icon: React.FC<IconProps> = ({
  name,
  fill,
  color,
  width,
  height,
  strokeColor,
  className = "",
  size = undefined,
  ...rest
}) => {
  const iconKey = name as BaseIcons;

  const SvgIcon = IconsMap[iconKey];

  const finalProps = filterUndefinedProps({
    ...(fill && { fill }),
    ...(strokeColor && { stroke: strokeColor }),
    width: width ?? size,
    height: height ?? size,
    ...(color && { style: { fill: color } }),
    className,
    ...rest,
  });

  if (!SvgIcon) return <IconPlaceholder size={size} />;

  return <SvgIcon {...finalProps} />;
};

export default Icon;
