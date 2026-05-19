import type { Metadata } from "next";
import AdminClientLayout from "./AdminClientLayout";

export const metadata: Metadata = {
  title: "إذاعة الجمهورية اليمنية — لوحة التحكم",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
