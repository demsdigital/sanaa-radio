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
  "figure", "figcaption",
];

// السماح بـ style على عناصر النص لأجل text-align: justify
const ALLOWED_ATTRS: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "width", "height", "style", "class"],
  iframe: ["src", "width", "height", "allowfullscreen", "frameborder", "allow", "title", "class", "style"],
  div: ["class", "style", "data-youtube-video"],
  figure: ["class", "style"],
  figcaption: ["class"],
  span: ["class", "style"],
  // عناصر النص تحتاج style لـ text-align
  p: ["style"],
  h2: ["style"],
  h3: ["style"],
  h4: ["style"],
  li: ["style"],
  blockquote: ["style"],
  "*": [],
};

// نسمح فقط بـ text-align كخاصية CSS آمنة
const ALLOWED_STYLES: sanitizeHtml.IOptions["allowedStyles"] = {
  "*": {
    "text-align": [/^(left|right|center|justify)$/],
  },
};

function sanitize(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    allowedStyles: ALLOWED_STYLES,
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

const STYLES = `
  .rich-content {
    line-height: 2;
    color: #334155;
    direction: rtl;
    text-align: right;
    font-size: 1rem;
  }
  .rich-content p {
    margin-bottom: 1.5rem;
  }
  .rich-content h2 {
    font-size: 1.35rem;
    font-weight: 700;
    color: #1e293b;
    margin: 1.75rem 0 0.75rem;
    padding-bottom: 0.4rem;
    border-bottom: 2px solid #e2e8f0;
  }
  .rich-content h3 {
    font-size: 1.15rem;
    font-weight: 600;
    color: #1e293b;
    margin: 1.25rem 0 0.5rem;
  }
  .rich-content ul {
    list-style: disc;
    padding-right: 1.75rem;
    margin: 0.75rem 0;
  }
  .rich-content ol {
    list-style: decimal;
    padding-right: 1.75rem;
    margin: 0.75rem 0;
  }
  .rich-content li {
    margin-bottom: 0.35rem;
  }
  .rich-content blockquote {
    border-right: 4px solid #3b82f6;
    padding: 0.75rem 1rem;
    background: #eff6ff;
    border-radius: 0 8px 8px 0;
    color: #1e40af;
    margin: 1.25rem 0;
    font-style: italic;
  }
  .rich-content a {
    color: #2563eb;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .rich-content a:hover { color: #1d4ed8; }

  /* صورة منفردة */
  .rich-content img {
    max-width: 100%;
    width: 100%;
    height: auto;
    border-radius: 12px;
    margin: 1.25rem 0;
    display: block;
    box-shadow: 0 2px 10px rgba(0,0,0,0.09);
  }

  /* معرض صور */
  .rich-content .image-gallery {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin: 1.25rem 0;
  }
  .rich-content .image-gallery img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 10px;
    margin: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.2s ease;
  }
  .rich-content .image-gallery img:hover { transform: scale(1.02); }

  @media (min-width: 640px) {
    .rich-content .image-gallery {
      grid-template-columns: repeat(3, 1fr);
    }
    .rich-content .image-gallery img { height: 180px; }
  }
  @media (max-width: 480px) {
    .rich-content .image-gallery { gap: 6px; }
    .rich-content .image-gallery img { height: 130px; }
  }

  /* iframe يوتيوب */
  .rich-content iframe,
  .rich-content [data-youtube-video] iframe {
    width: 100%;
    max-width: 100%;
    border-radius: 10px;
    aspect-ratio: 16/9;
    height: auto;
    margin: 1rem 0;
    display: block;
  }
  .rich-content [data-youtube-video] { margin: 1rem 0; }
`;

export default function RichTextContent({ html, className = "" }: Props) {
  if (!html) return null;
  const clean = sanitize(html);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div
        className={`rich-content ${className}`}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    </>
  );
}
