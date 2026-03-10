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
    <Button
      asChild
      className="rounded-full border border-blue-500 bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md hover:from-blue-800 hover:to-blue-700"
    >
      <Link href="/properties/new">{label}</Link>
    </Button>
  );
}
