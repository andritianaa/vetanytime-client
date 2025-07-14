"use client";

import Markdown from "markdown-to-jsx";
import { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type ClientMarkdownProps = ComponentPropsWithoutRef<typeof Markdown>;

export const ClientMarkdown = ({
  children,
  className,
  ...props
}: ClientMarkdownProps) => {
  return (
    <Markdown className={cn("prose", className)} {...props}>
      {children}
    </Markdown>
  );
};
