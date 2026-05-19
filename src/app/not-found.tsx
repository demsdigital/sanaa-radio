import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <div className="text-center">
        <div className="text-8xl font-black text-blue-600 mb-4">404</div>
        <h1 className="text-slate-900 text-2xl font-black mb-2">الصفحة غير موجودة</h1>
        <p className="text-slate-500 text-sm mb-8">الرابط الذي تبحث عنه غير موجود أو تم نقله</p>
        <Link href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
