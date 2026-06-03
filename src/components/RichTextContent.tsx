import sanitizeHtml from "sanitize-html";

type Props = {
  html: string;
  className?: string;
};

const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s",
  "h2", "h3", "h4",
  "ul", "ol", "li",
  "blockquote",
  "a",
  "img",
  "iframe",
  "div", "span",
];

const ALLOWED_ATTRS: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "width", "height", "style", "class"],
  iframe: ["src", "width", "height", "allowfullscreen", "frameborder", "allow", "title", "class", "style"],
  div: ["class", "style", "data-youtube-video"],
  span: ["class", "style"],
  "*": [],
};

function sanitize(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com"],
    allowedSchemes: ["https", "http"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    },
  });
}

export default function RichTextContent({ html, className = "" }: Props) {
  if (!html) return null;
  const clean = sanitize(html);
  return (
    <div
      className={`rich-content ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
