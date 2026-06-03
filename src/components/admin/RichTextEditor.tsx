"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { useEffect, useState, useCallback } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

type ButtonProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
};

function ToolBtn({ onClick, active, title, children, disabled }: ButtonProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={[
        "px-2 py-1 rounded text-sm font-medium transition-colors",
        active
          ? "bg-blue-600 text-white"
          : "text-slate-600 hover:bg-slate-100",
        disabled ? "opacity-40 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, placeholder = "اكتب المحتوى هنا...", minHeight = 280 }: Props) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [showImgInput, setShowImgInput] = useState(false);
  const [ytUrl, setYtUrl] = useState("");
  const [showYtInput, setShowYtInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: {},
        orderedList: {},
        blockquote: {},
        bold: {},
        italic: {},
        code: false,
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ width: 640, height: 360 }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "outline-none",
        dir: "rtl",
        "data-placeholder": placeholder,
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // sync external value changes (e.g. when switching edit targets)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value && value !== undefined) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (!linkUrl) { editor.chain().focus().unsetLink().run(); }
    else { editor.chain().focus().setLink({ href: linkUrl }).run(); }
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const insertImage = useCallback(() => {
    if (!editor || !imgUrl) return;
    editor.chain().focus().setImage({ src: imgUrl }).run();
    setImgUrl("");
    setShowImgInput(false);
  }, [editor, imgUrl]);

  const insertYoutube = useCallback(() => {
    if (!editor || !ytUrl) return;
    editor.chain().focus().setYoutubeVideo({ src: ytUrl }).run();
    setYtUrl("");
    setShowYtInput(false);
  }, [editor, ytUrl]);

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white" dir="rtl">
      {/* شريط الأدوات */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-slate-200 bg-slate-50">
        {/* نص */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="عريض">
          <b>ع</b>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="مائل">
          <i>ع</i>
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="تحته خط">
          <u>ع</u>
        </ToolBtn>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        {/* عناوين */}
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="عنوان H2">
          H2
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="عنوان H3">
          H3
        </ToolBtn>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        {/* قوائم */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="قائمة نقطية">
          ≡
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="قائمة مرقّمة">
          1≡
        </ToolBtn>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        {/* اقتباس */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="اقتباس">
          ""
        </ToolBtn>

        <div className="w-px h-5 bg-slate-300 mx-1" />

        {/* رابط */}
        <ToolBtn onClick={() => { setShowLinkInput(v => !v); setShowImgInput(false); setShowYtInput(false); }} active={editor.isActive("link") || showLinkInput} title="إدراج رابط">
          🔗
        </ToolBtn>

        {/* صورة */}
        <ToolBtn onClick={() => { setShowImgInput(v => !v); setShowLinkInput(false); setShowYtInput(false); }} active={showImgInput} title="إدراج صورة">
          🖼️
        </ToolBtn>

        {/* يوتيوب */}
        <ToolBtn onClick={() => { setShowYtInput(v => !v); setShowLinkInput(false); setShowImgInput(false); }} active={showYtInput} title="إدراج يوتيوب">
          ▶
        </ToolBtn>

        <div className="flex-1" />

        {/* تراجع / إعادة */}
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="تراجع">
          ↩
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="إعادة">
          ↪
        </ToolBtn>
      </div>

      {/* حقل الرابط */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-blue-100 bg-blue-50">
          <input
            autoFocus
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); applyLink(); } if (e.key === "Escape") setShowLinkInput(false); }}
            placeholder="https://..."
            dir="ltr"
            className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
          />
          <button type="button" onClick={applyLink} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold">إدراج</button>
          {editor.isActive("link") && (
            <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLinkInput(false); }} className="text-red-500 text-xs px-2 py-1.5 border border-red-200 rounded-lg">إزالة</button>
          )}
        </div>
      )}

      {/* حقل الصورة */}
      {showImgInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-green-100 bg-green-50">
          <input
            autoFocus
            value={imgUrl}
            onChange={e => setImgUrl(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); insertImage(); } if (e.key === "Escape") setShowImgInput(false); }}
            placeholder="https://example.com/image.jpg"
            dir="ltr"
            className="flex-1 bg-white border border-green-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-green-400"
          />
          <button type="button" onClick={insertImage} className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold">إدراج</button>
        </div>
      )}

      {/* حقل يوتيوب */}
      {showYtInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-red-100 bg-red-50">
          <input
            autoFocus
            value={ytUrl}
            onChange={e => setYtUrl(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); insertYoutube(); } if (e.key === "Escape") setShowYtInput(false); }}
            placeholder="https://www.youtube.com/watch?v=..."
            dir="ltr"
            className="flex-1 bg-white border border-red-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-red-400"
          />
          <button type="button" onClick={insertYoutube} className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold">إدراج</button>
        </div>
      )}

      {/* منطقة التحرير */}
      <div
        className="px-4 py-3 text-slate-800 text-sm leading-relaxed"
        style={{ minHeight }}
      >
        <style>{`
          .tiptap p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            color: #94a3b8;
            float: right;
            pointer-events: none;
            height: 0;
          }
          .tiptap h2 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
          .tiptap h3 { font-size: 1.1rem; font-weight: 600; margin: 0.75rem 0 0.4rem; }
          .tiptap ul { list-style: disc; padding-right: 1.5rem; margin: 0.5rem 0; }
          .tiptap ol { list-style: decimal; padding-right: 1.5rem; margin: 0.5rem 0; }
          .tiptap blockquote { border-right: 4px solid #3b82f6; padding-right: 1rem; color: #475569; margin: 0.75rem 0; font-style: italic; }
          .tiptap a { color: #2563eb; text-decoration: underline; }
          .tiptap img { max-width: 100%; border-radius: 8px; margin: 0.5rem 0; }
          .tiptap .youtube-wrapper { margin: 1rem 0; }
          .tiptap iframe { max-width: 100%; border-radius: 8px; }
          .tiptap p { margin-bottom: 0.5rem; }
        `}</style>
        <EditorContent editor={editor} className="tiptap" />
      </div>

      {/* عداد الكلمات */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center gap-4 text-xs text-slate-400">
        {(() => {
          const text = editor.getText();
          const words = text.trim() ? text.trim().split(/\s+/).length : 0;
          const readTime = Math.max(1, Math.ceil(words / 200));
          return (
            <>
              <span>{words} كلمة</span>
              <span>وقت القراءة: ~{readTime} دقيقة</span>
            </>
          );
        })()}
      </div>
    </div>
  );
}
