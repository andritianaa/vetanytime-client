import rehypeAutolinkHeading from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import rehypeShiki from "@shikijs/rehype";

import type { PluggableList } from "unified";

const shikiPlugin = [
  rehypeShiki,
  {
    themes: {
      light: "github-light",
    },
  },
] satisfies PluggableList[number];

export const rehypePlugins = [
  shikiPlugin,
  rehypeSlug,
  rehypeAutolinkHeading,
] satisfies PluggableList;

export const remarkPlugins = [remarkGfm] satisfies PluggableList;
