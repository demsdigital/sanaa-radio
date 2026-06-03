"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { useEffect, useState, useCallback, useRef } from "react";
import MediaPicker from "@/components/MediaPicker";

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
        active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100",
        disabled ? "opacity-40 cursor-not-allowed" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// حساب الصور من HTML للاختبار
function wrapGallery(urls: string[]): string {
  if (urls.length === 1) return `<img src="${urls[0]}" alt="" />`;
  const imgs = urls.map(u => `<img src="${u}" alt="" />`).join("");
  return `<div class="image-gallery">${imgs}</div>`;
}

type ImagePanel = "url" | "upload" | "library" | null;

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "اكتب المحتوى هنا...",
  minHeight = 280,
}: Props) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [ytUrl, setYtUrl] = useState("");
  const [showYtInput, setShowYtInput] = useState(false);

  // لوح إدراج الصورة
  const [imgPanel, setImgPanel] = useState<ImagePanel>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value && value !== undefined) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  // إدراج صورة / صور داخل المحرر
  const insertImages = useCallback((urls: string[]) => {
    if (!editor || urls.length === 0) return;
    if (urls.length === 1) {
      editor.chain().focus().setImage({ src: urls[0] }).run();
    } else {
      editor.chain().focus().insertContent(wrapGallery(urls)).run();
    }
  }, [editor]);

  // رفع صورة/صور عبر /api/upload
  async function handleUploadFiles(files: FileList) {
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(0);

    const urls: string[] = [];
    const total = files.length;

    for (let i = 0; i < total; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name}: الحجم يتجاوز 5 ميغابايت`); continue; }
      try {
        const fd = new FormData(); fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("فشل الرفع");
        const { url } = await res.json();
        urls.push(url);
        setUploadProgress(Math.round(((i + 1) / total) * 100));
      } catch {
        alert(`فشل رفع: ${file.name}`);
      }
    }

    setUploading(false);
    setUploadProgress(0);
    if (uploadInputRef.current) uploadInputRef.current.value = "";

    if (urls.length > 0) {
      insertImages(urls);
      setImgPanel(null);
    }
  }

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (!linkUrl) { editor.chain().focus().unsetLink().run(); }
    else { editor.chain().focus().setLink({ href: linkUrl }).run(); }
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const insertYoutube = useCallback(() => {
    if (!editor || !ytUrl) return;
    editor.chain().focus().setYoutubeVideo({ src: ytUrl }).run();
    setYtUrl("");
    setShowYtInput(false);
  }, [editor, ytUrl]);

  function toggleImgPanel(panel: Exclude<ImagePanel, null>) {
    setImgPanel(prev => prev === panel ? null : panel);
    setShowLinkInput(false);
    setShowYtInput(false);
  }

  if (!editor) return null;

  return (
    <>
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

          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="عنوان H2">
            H2
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="عنوان H3">
            H3
          </ToolBtn>

          <div className="w-px h-5 bg-slate-300 mx-1" />

          <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="قائمة نقطية">
            ≡
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="قائمة مرقّمة">
            1≡
          </ToolBtn>

          <div className="w-px h-5 bg-slate-300 mx-1" />

          <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="اقتباس">
            ""
          </ToolBtn>

          <div className="w-px h-5 bg-slate-300 mx-1" />

          {/* رابط */}
          <ToolBtn onClick={() => { setShowLinkInput(v => !v); setImgPanel(null); setShowYtInput(false); }} active={editor.isActive("link") || showLinkInput} title="إدراج رابط">
            🔗
          </ToolBtn>

          {/* صورة — مجموعة أزرار */}
          <ToolBtn onClick={() => toggleImgPanel("url")} active={imgPanel === "url"} title="صورة برابط URL">
            🖼️
          </ToolBtn>
          <ToolBtn onClick={() => toggleImgPanel("upload")} active={imgPanel === "upload"} title="رفع صورة">
            📤
          </ToolBtn>
          <ToolBtn onClick={() => { setImgPanel(null); setShowMediaPicker(true); setShowLinkInput(false); setShowYtInput(false); }} active={showMediaPicker} title="اختيار من المكتبة">
            🗂️
          </ToolBtn>

          {/* يوتيوب */}
          <ToolBtn onClick={() => { setShowYtInput(v => !v); setImgPanel(null); setShowLinkInput(false); }} active={showYtInput} title="إدراج يوتيوب">
            ▶
          </ToolBtn>

          <div className="flex-1" />

          <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="تراجع">
            ↩
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="إعادة">
            ↪
          </ToolBtn>
        </div>

        {/* ===== لوح الرابط ===== */}
        {showLinkInput && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-blue-100 bg-blue-50">
            <input autoFocus value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); applyLink(); } if (e.key === "Escape") setShowLinkInput(false); }}
              placeholder="https://..." dir="ltr"
              className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400" />
            <button type="button" onClick={applyLink} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold">إدراج</button>
            {editor.isActive("link") && (
              <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLinkInput(false); }}
                className="text-red-500 text-xs px-2 py-1.5 border border-red-200 rounded-lg">إزالة</button>
            )}
          </div>
        )}

        {/* ===== لوح الصورة برابط URL ===== */}
        {imgPanel === "url" && (
          <div className="border-b border-green-100 bg-green-50 px-3 py-2">
            <div className="text-xs text-green-700 font-medium mb-1.5">إدراج صورة برابط URL</div>
            <div className="flex items-center gap-2">
              <input autoFocus value={imgUrl} onChange={e => setImgUrl(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (imgUrl.trim()) { insertImages([imgUrl.trim()]); setImgUrl(""); setImgPanel(null); }
                  }
                  if (e.key === "Escape") setImgPanel(null);
                }}
                placeholder="https://example.com/image.jpg" dir="ltr"
                className="flex-1 bg-white border border-green-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-green-400" />
              <button type="button"
                onClick={() => { if (imgUrl.trim()) { insertImages([imgUrl.trim()]); setImgUrl(""); setImgPanel(null); } }}
                disabled={!imgUrl.trim()}
                className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold disabled:opacity-50">
                إدراج
              </button>
            </div>
          </div>
        )}

        {/* ===== لوح رفع الصورة ===== */}
        {imgPanel === "upload" && (
          <div className="border-b border-orange-100 bg-orange-50 px-3 py-2.5">
            <div className="text-xs text-orange-700 font-medium mb-1.5">رفع صورة أو عدة صور (يُدرج في المحرر مباشرة)</div>
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => { if (e.target.files?.length) handleUploadFiles(e.target.files); }}
            />
            {uploading ? (
              <div className="space-y-2">
                <div className="w-full bg-orange-100 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <div className="text-xs text-orange-600 text-center">{uploadProgress}% — جاري الرفع...</div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button type="button"
                  onClick={() => uploadInputRef.current?.click()}
                  className="flex-1 bg-orange-500 text-white text-xs py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors text-center">
                  📁 اختر صورة أو أكثر من جهازك
                </button>
                <span className="text-xs text-orange-400">PNG/JPG/WebP · 5MB</span>
              </div>
            )}
          </div>
        )}

        {/* ===== لوح يوتيوب ===== */}
        {showYtInput && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-red-100 bg-red-50">
            <input autoFocus value={ytUrl} onChange={e => setYtUrl(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); insertYoutube(); } if (e.key === "Escape") setShowYtInput(false); }}
              placeholder="https://www.youtube.com/watch?v=..." dir="ltr"
              className="flex-1 bg-white border border-red-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-red-400" />
            <button type="button" onClick={insertYoutube} className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold">إدراج</button>
          </div>
        )}

        {/* ===== منطقة التحرير ===== */}
        <div className="px-4 py-3 text-slate-800 text-sm leading-relaxed" style={{ minHeight }}>
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
            .tiptap img { max-width: 100%; border-radius: 8px; margin: 0.5rem auto; display: block; }
            .tiptap .image-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; margin: 1rem 0; }
            .tiptap .image-gallery img { width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin: 0; }
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
                <span className="mr-auto text-slate-300 text-[10px]">
                  🖼️ رابط · 📤 رفع · 🗂️ مكتبة
                </span>
              </>
            );
          })()}
        </div>
      </div>

      {/* Media Picker — خارج حاوية المحرر لتجنب تداخل z-index */}
      {showMediaPicker && (
        <MediaPicker
          multiSelect
          onSelect={url => insertImages([url])}
          onSelectMultiple={urls => insertImages(urls)}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </>
  );
}
