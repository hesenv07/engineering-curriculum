import type TSvgElement from "@/shared/types/TSvgElement";

const SuccessIcon = (props: TSvgElement) => {
  return (
    <svg
      width="14"
      height="14"
      fill="none"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
};

export default SuccessIcon;
