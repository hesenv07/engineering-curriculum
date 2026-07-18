import React from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { MDXComponents } from "@/shared/ui/MDX/MDXComponents";

import type { ILessonContentProps } from "./LessonContent.types";

const LessonContent = ({ source }: ILessonContentProps) => {
  return (
    <MDXRemote
      source={source}
      components={MDXComponents as Record<string, React.ComponentType<object>>}
      options={{ mdxOptions: { remarkPlugins: [remarkGfm], format: "mdx" } }}
    />
  );
};

export default LessonContent;
