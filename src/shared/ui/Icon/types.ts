const IconsType = {
  SVG: "SVG",
  JSON: "JSON",
} as const;

export default IconsType;

export type IconProps = {
  name: string;
  size?: number;
  fill?: string;
  width?: number;
  color?: string;
  height?: number;
  className?: string;
  strokeColor?: string;
  type?: keyof typeof IconsType;
};

export type TIconCache = {
  [key: string]: React.LazyExoticComponent<
    React.ComponentType<React.SVGProps<SVGSVGElement>>
  >;
};
