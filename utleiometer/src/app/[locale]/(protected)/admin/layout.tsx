"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { currentUser, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!currentUser || !isAdmin)) {
      router.replace("/");
    }
  }, [loading, currentUser, isAdmin, router]);

  if (loading) {
    return (
      <main className="bg-muted min-h-screen flex items-center justify-center p-6">
        <div className="text-center">Laster...</div>
      </main>
    );
  }

  if (!currentUser || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
