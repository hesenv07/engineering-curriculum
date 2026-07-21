import type TSvgElement from "@/shared/types/TSvgElement";

const ArrowDownIcon = (props: TSvgElement) => {
  return (
    <svg
      width="12"
      height="12"
      fill="none"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
};

export default ArrowDownIcon;
