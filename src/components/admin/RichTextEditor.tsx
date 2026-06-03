"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect, useState, useCallback, useRef } from "react";
import MediaPicker from "@/components/MediaPicker";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

function ToolBtn({
  onClick, active, title, children, disabled,
}: {
  onClick: () => void; active?: boolean; title: string;
  children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button
      type="button" title={title} disabled={disabled} onClick={onClick}
      className={[
        "px-2 py-1 rounded text-sm font-medium transition-colors select-none",
        active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100",
        disabled ? "opacity-40 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function wrapGallery(urls: string[]): string {
  if (urls.length === 1) return `<img src="${urls[0]}" alt="" />`;
  const imgs = urls.map(u => `<img src="${u}" alt="" />`).join("");
  return `<div class="image-gallery">${imgs}</div>`;
}

type ImgPanel = "url" | "upload" | null;

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "اكتب المحتوى هنا...",
  minHeight = 280,
}: Props) {
  // ── حالة الألواح ──
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showYtInput, setShowYtInput] = useState(false);
  const [ytUrl, setYtUrl] = useState("");
  const [imgPanel, setImgPanel] = useState<ImgPanel>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "right",
      }),
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

  // مزامنة القيمة الخارجية
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value && value !== undefined) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  // إدراج صورة أو معرض
  const insertImages = useCallback((urls: string[]) => {
    if (!editor || !urls.length) return;
    if (urls.length === 1) {
      editor.chain().focus().setImage({ src: urls[0] }).run();
    } else {
      editor.chain().focus().insertContent(wrapGallery(urls)).run();
    }
  }, [editor]);

  // رفع ملفات
  async function handleUpload(files: FileList) {
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(0);
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name}: الحجم يتجاوز 5 MB`); continue; }
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error();
        const { url } = await res.json();
        urls.push(url);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      } catch {
        alert(`فشل رفع: ${file.name}`);
      }
    }
    setUploading(false);
    setUploadProgress(0);
    if (uploadRef.current) uploadRef.current.value = "";
    if (urls.length) { insertImages(urls); setImgPanel(null); }
  }

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
    }
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const applyYt = useCallback(() => {
    if (!editor || !ytUrl.trim()) return;
    editor.chain().focus().setYoutubeVideo({ src: ytUrl.trim() }).run();
    setYtUrl("");
    setShowYtInput(false);
  }, [editor, ytUrl]);

  function togglePanel(panel: ImgPanel) {
    setImgPanel(p => p === panel ? null : panel);
    setShowLinkInput(false);
    setShowYtInput(false);
  }

  function closeAll() {
    setShowLinkInput(false);
    setShowYtInput(false);
    setImgPanel(null);
  }

  if (!editor) return null;

  const words = (() => {
    const t = editor.getText().trim();
    return t ? t.split(/\s+/).length : 0;
  })();
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <>
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white" dir="rtl">

        {/* ━━━ شريط الأدوات ━━━ */}
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50">
          {/* نص */}
          <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="عريض"><b>ع</b></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="مائل"><i>ع</i></ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="تحته خط"><u>ع</u></ToolBtn>

          <div className="w-px h-4 bg-slate-300 mx-1" />

          {/* عناوين */}
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2">H2</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="H3">H3</ToolBtn>

          <div className="w-px h-4 bg-slate-300 mx-1" />

          {/* قوائم */}
          <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="قائمة نقطية">≡</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="قائمة مرقّمة">1≡</ToolBtn>

          <div className="w-px h-4 bg-slate-300 mx-1" />

          {/* اقتباس */}
          <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="اقتباس">❝</ToolBtn>

          <div className="w-px h-4 bg-slate-300 mx-1" />

          {/* محاذاة — justify */}
          <ToolBtn
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            active={editor.isActive({ textAlign: "justify" })}
            title="ضبط النص بالتساوي"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="0" y="1" width="14" height="1.5" rx="0.75"/>
              <rect x="0" y="4.5" width="14" height="1.5" rx="0.75"/>
              <rect x="0" y="8" width="14" height="1.5" rx="0.75"/>
              <rect x="0" y="11.5" width="14" height="1.5" rx="0.75"/>
            </svg>
          </ToolBtn>

          <div className="w-px h-4 bg-slate-300 mx-1" />

          {/* رابط */}
          <ToolBtn
            onClick={() => { setShowLinkInput(v => !v); setImgPanel(null); setShowYtInput(false); }}
            active={editor.isActive("link") || showLinkInput}
            title="إدراج رابط نصي"
          >
            🔗
          </ToolBtn>

          {/* يوتيوب */}
          <ToolBtn
            onClick={() => { setShowYtInput(v => !v); setImgPanel(null); setShowLinkInput(false); }}
            active={showYtInput}
            title="إدراج فيديو يوتيوب"
          >
            ▶
          </ToolBtn>

          <div className="w-px h-4 bg-slate-300 mx-1" />

          {/* أزرار الصور */}
          <ToolBtn
            onClick={() => togglePanel("url")}
            active={imgPanel === "url"}
            title="إدراج صورة برابط URL"
          >
            🖼️
          </ToolBtn>
          <ToolBtn
            onClick={() => togglePanel("upload")}
            active={imgPanel === "upload"}
            title="رفع صورة من جهازك"
          >
            📤
          </ToolBtn>
          <ToolBtn
            onClick={() => { closeAll(); setShowPicker(true); }}
            title="اختيار من مكتبة الصور"
          >
            🗂️
          </ToolBtn>

          <div className="flex-1" />

          {/* تراجع / إعادة */}
          <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="تراجع">↩</ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="إعادة">↪</ToolBtn>
        </div>

        {/* ━━━ لوح الرابط النصي (بين الشريط والمحرر) ━━━ */}
        {showLinkInput && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-blue-100 bg-blue-50">
            <input
              autoFocus value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); applyLink(); } if (e.key === "Escape") setShowLinkInput(false); }}
              placeholder="https://..." dir="ltr"
              className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
            />
            <button type="button" onClick={applyLink} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold">إدراج</button>
            {editor.isActive("link") && (
              <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLinkInput(false); }}
                className="text-red-500 text-xs px-2 py-1.5 border border-red-200 rounded-lg">إزالة</button>
            )}
          </div>
        )}

        {/* ━━━ لوح يوتيوب (بين الشريط والمحرر) ━━━ */}
        {showYtInput && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-red-100 bg-red-50">
            <input
              autoFocus value={ytUrl} onChange={e => setYtUrl(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); applyYt(); } if (e.key === "Escape") setShowYtInput(false); }}
              placeholder="https://www.youtube.com/watch?v=..." dir="ltr"
              className="flex-1 bg-white border border-red-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-red-400"
            />
            <button type="button" onClick={applyYt} className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold">إدراج</button>
          </div>
        )}

        {/* ━━━ منطقة التحرير ━━━ */}
        <div className="px-4 py-3 text-slate-800 text-sm leading-relaxed" style={{ minHeight }}>
          <style>{`
            .tiptap { min-height: ${minHeight - 48}px; }
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
            .tiptap p { margin-bottom: 0.5rem; }
            .tiptap img { max-width: 100%; border-radius: 8px; margin: 0.5rem auto; display: block; }
            .tiptap .image-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; margin: 1rem 0; }
            .tiptap .image-gallery img { width: 100%; height: 140px; object-fit: cover; border-radius: 8px; margin: 0; }
            .tiptap .youtube-wrapper, .tiptap [data-youtube-video] { margin: 1rem 0; }
            .tiptap iframe { max-width: 100%; border-radius: 8px; }
          `}</style>
          <EditorContent editor={editor} className="tiptap" />
        </div>

        {/* ━━━ ألواح الصور (بين المحرر والفوتر) ━━━ */}

        {/* لوح رابط URL */}
        {imgPanel === "url" && (
          <div className="border-t border-green-100 bg-green-50 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-700 font-medium whitespace-nowrap">رابط الصورة:</span>
              <input
                autoFocus value={imgUrl} onChange={e => setImgUrl(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (imgUrl.trim()) { insertImages([imgUrl.trim()]); setImgUrl(""); setImgPanel(null); }
                  }
                  if (e.key === "Escape") setImgPanel(null);
                }}
                placeholder="https://..." dir="ltr"
                className="flex-1 bg-white border border-green-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-green-400"
              />
              <button
                type="button"
                onClick={() => { if (imgUrl.trim()) { insertImages([imgUrl.trim()]); setImgUrl(""); setImgPanel(null); } }}
                disabled={!imgUrl.trim()}
                className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                إدراج
              </button>
              <button type="button" onClick={() => setImgPanel(null)} className="text-slate-400 text-lg w-6 h-6 flex items-center justify-center hover:text-slate-600">×</button>
            </div>
          </div>
        )}

        {/* لوح رفع الصورة */}
        {imgPanel === "upload" && (
          <div className="border-t border-orange-100 bg-orange-50 px-3 py-2.5">
            <input
              ref={uploadRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => { if (e.target.files?.length) handleUpload(e.target.files); }}
            />
            {uploading ? (
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-orange-100 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="text-xs text-orange-600 whitespace-nowrap">{uploadProgress}% جاري الرفع...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => uploadRef.current?.click()}
                  className="flex-1 bg-orange-500 text-white text-xs py-1.5 rounded-lg font-bold hover:bg-orange-600 transition-colors"
                >
                  📁 اختر صورة أو أكثر من جهازك
                </button>
                <span className="text-xs text-orange-400 whitespace-nowrap">PNG/JPG/WebP · 5 MB</span>
                <button type="button" onClick={() => setImgPanel(null)} className="text-slate-400 text-lg w-6 h-6 flex items-center justify-center hover:text-slate-600">×</button>
              </div>
            )}
          </div>
        )}

        {/* ━━━ الفوتر: أزرار الصور + عداد الكلمات ━━━ */}
        <div className="border-t border-slate-100 bg-slate-50 px-3 py-2 flex items-center gap-1">
          {/* أزرار إدراج الصور */}
          <button
            type="button"
            onClick={() => togglePanel("url")}
            className={[
              "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
              imgPanel === "url" ? "bg-green-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-green-400 hover:text-green-700",
            ].join(" ")}
            title="إدراج صورة برابط URL"
          >
            🖼️ <span>رابط</span>
          </button>
          <button
            type="button"
            onClick={() => togglePanel("upload")}
            className={[
              "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors",
              imgPanel === "upload" ? "bg-orange-500 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-orange-400 hover:text-orange-700",
            ].join(" ")}
            title="رفع صورة من جهازك"
          >
            📤 <span>رفع</span>
          </button>
          <button
            type="button"
            onClick={() => { closeAll(); setShowPicker(true); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-700 transition-colors"
            title="اختيار من مكتبة الصور"
          >
            🗂️ <span>مكتبة</span>
          </button>

          {/* عداد الكلمات */}
          <span className="mr-auto text-xs text-slate-400">
            {words} كلمة · ~{readTime} د
          </span>
        </div>

      </div>

      {/* MediaPicker خارج الحاوية */}
      {showPicker && (
        <MediaPicker
          multiSelect
          onSelect={url => insertImages([url])}
          onSelectMultiple={urls => insertImages(urls)}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
