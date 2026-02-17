"use client";

import { Button } from "@/ui/primitives/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await signOut(auth);
      
      // Redirect to homepage
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
      setError("Kunne ikke logge ut. Prøv igjen.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={handleLogout} 
        disabled={isLoading}
        variant="ghost"
      >
        {isLoading ? "Logger ut..." : "Logg ut"}
      </Button>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </>
  );
}
