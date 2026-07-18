import type { IShowProps } from "./Show.types";

const Show = ({ when, fallback = null, children }: IShowProps) => {
  return when ? children : fallback;
};

export default Show;
