"use client";

import Link from "next/link";

import { Button } from "@/ui/primitives/button";
import { useAuth } from "@/features/auth/hooks/useAuth";

type AddReviewHeaderButtonProps = {
  label: string;
};

export function AddReviewHeaderButton({ label }: AddReviewHeaderButtonProps) {
  const { currentUser, loading } = useAuth();

  if (loading || !currentUser) {
    return null;
  }

  return (
    <Button asChild variant="outline">
      <Link href="/properties/new">{label}</Link>
    </Button>
  );
}
