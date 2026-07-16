type TWithMdxName = {
  mdxName?: string;
};

export function isMdxTag(type: unknown, tagName: string): boolean {
  return typeof type === 'function' && (type as TWithMdxName).mdxName === tagName;
}
