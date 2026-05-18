"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

type Me = {
  id: number;
  name: string;
  role: string;
  permissions: string[];
};

const allNavItems = [
  { href: "/admin/dashboard", label: "الرئيسية",          icon: "🏠", perm: null },
  { href: "/admin/programs",  label: "البرامج",            icon: "📻", perm: "programs" },
  { href: "/admin/episodes",  label: "الحلقات",            icon: "🎙️", perm: "episodes" },
  { href: "/admin/schedule",  label: "الجدول",             icon: "📅", perm: "schedule" },
  { href: "/admin/news",      label: "الأخبار",            icon: "📰", perm: "news" },
  { href: "/admin/articles",   label: "الكتابات",           icon: "✍️", perm: "articles" },
  