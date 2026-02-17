"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";

export function WelcomeMessage() {
  const { currentUser, loading } = useAuth();

  if (loading || !currentUser) return null;

  return (
    <span className="font-medium text-gray-700">
      Velkommen, {currentUser.displayName || currentUser.email}!
    </span>
  );
}
