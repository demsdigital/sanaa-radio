"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function usePermission(required: string | null) {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(me => {
        if (!me || me.error) { router.push("/login"); return; }
        if (required === null) return; // dashboard - للكل
        if (me.role === "admin") return; // admin - كل شيء
        if (required === "admin") { router.push("/admin/dashboard"); return; }
        const perms: string[] = me.permissions || [];
        if (!perms.includes(required)) router.push("/admin/dashboard");
      })
      .catch(() => router.push("/login"));
  }, []);
}
