import Markdown, { type Components, type UrlTransform } from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import type { ReadmeDoc } from "@/lib/projects/types";
import { resolveReadmeUrl } from "@/lib/readme/urls";

interface ReadmeProps {
  doc: ReadmeDoc;
}

/** GitHub's allowlist, minus `longDesc` on images (one more URL attribute nobody needs). */
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    img: (defaultSchema.attributes?.img ?? []).filter((attribute) => attribute !== "longDesc"),
  },
};

/** react-markdown passes its AST node as a prop; it must not reach the DOM. */
function withoutNode<P extends { node?: unknown }>(props: P): Omit<P, "node"> {
  const rest = { ...props };
  delete rest.node;
  return rest;
}

const scrollableClass = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** The page title is the only h1: README headings move one level down (h6 stays h6). */
const components: Components = {
  h1: (props) => <h2 {...withoutNode(props)} />,
  h2: (props) => <h3 {...withoutNode(props)} />,
  h3: (props) => <h4 {...withoutNode(props)} />,
  h4: (props) => <h5 {...withoutNode(props)} />,
  h5: (props) => <h6 {...withoutNode(props)} />,
  a: (props) => {
    const { href, children, ...rest } = withoutNode(props);
    // Rejected URLs and in-page anchors (headings get no matching ids) become plain text.
    if (!href || href.startsWith("#")) return <span>{children}</span>;
    if (href.startsWith("mailto:")) return <a href={href} {...rest}>{children}</a>;
    return (
      <a {...rest} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  // README images live on arbitrary hosts, so next/image (host allowlist) does not apply.
  img: (props) => {
    if (!props.src) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...withoutNode(props)}
        alt={props.alt ?? ""}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
    );
  },
  // Wide code blocks and tables scroll horizontally: keyboard users must be able to focus them.
  pre: (props) => <pre {...withoutNode(props)} tabIndex={0} className={scrollableClass} />,
  table: (props) => <table {...withoutNode(props)} tabIndex={0} className={scrollableClass} />,
};

/**
 * Renders untrusted README markdown. Raw HTML is never parsed (react-markdown escapes it),
 * rehype-sanitize applies GitHub's allowlist, and every URL goes through resolveReadmeUrl.
 */
export function Readme({ doc }: ReadmeProps) {
  // null (not "") removes the attribute: react-markdown would keep an empty href/src.
  const urlTransform: UrlTransform = (url, key) =>
    resolveReadmeUrl(url, doc.context, key === "src" ? "image" : "link") || null;

  return (
    <div className="readme">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        urlTransform={urlTransform}
        components={components}
      >
        {doc.markdown}
      </Markdown>
    </div>
  );
}
