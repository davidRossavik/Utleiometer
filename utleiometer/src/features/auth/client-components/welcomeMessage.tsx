"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";

type Props = {
  text: string
}

export function WelcomeMessage({text}: Props) {
  const { currentUser, loading } = useAuth();

  if (loading || !currentUser) return null;

  return (
    <span className="font-medium text-gray-700">
      {text}, {currentUser.displayName || currentUser.email}!
    </span>
  );
}
