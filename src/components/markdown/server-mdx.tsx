import { MDXRemote } from "next-mdx-remote-client/rsc";

import { cn } from "@/lib/utils";

import { rehypePlugins, remarkPlugins } from "./markdown.config";

interface ServerMdxProps {
  source: string;
  className?: string;
}

// * If you want to add custom component, such as an "EmailForm", you can add it to the MdxComponent object.
const MdxComponent = {} satisfies Record<string, React.ComponentType>;

export const ServerMdx = (props: ServerMdxProps) => {
  return (
    <div className={cn("prose ", props.className)}>
      <RenderMdx {...props} />
    </div>
  );
};

const RenderMdx = (props: ServerMdxProps) => {
  return (
    <MDXRemote
      source={props.source}
      components={MdxComponent}
      options={{
        mdxOptions: {
          remarkPlugins: remarkPlugins,
          rehypePlugins: rehypePlugins,
          format: "mdx",
        },
      }}
    />
  );
};
