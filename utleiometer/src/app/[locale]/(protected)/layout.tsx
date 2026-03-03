"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !currentUser) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
    }
  }, [loading, currentUser, router, pathname]);

  if (loading) {
    return (
      <main className="bg-muted min-h-screen flex items-center justify-center p-6">
        <div className="text-center">Laster...</div>
      </main>
    );
  }

  if (!currentUser) {
    return null;
  }

  return <>{children}</>;
}