"use client";

import Link from "next/link";
import { Button } from "@/ui/primitives/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LogoutButton } from "./logoutButton";

export function AuthButtons() {
  const { currentUser, loading } = useAuth();

  // Vis ingenting mens vi sjekker auth state
  if (loading) {
    return null;
  }

  // Hvis innlogget, vis logout-knapp
  if (currentUser) {
    return <LogoutButton />;
  }

  // Hvis ikke innlogget, vis login og registrer knapper
  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost">
        <Link href="/login">Logg inn</Link>
      </Button>
      <Button asChild>
        <Link href="/register">Opprett bruker</Link>
      </Button>
    </div>
  );
}
