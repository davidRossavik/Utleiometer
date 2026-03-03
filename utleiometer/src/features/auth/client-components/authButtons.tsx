"use client";

import Link from "next/link";
import { Button } from "@/ui/primitives/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/primitives/popover";
import { signOut, deleteUser } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteUserData } from "@/app/actions/deleteUser";

export function AuthButtons() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    
    const confirmed = window.confirm(
      "Er du sikker på at du vil slette kontoen din? Dette kan ikke angres."
    );
    
    if (!confirmed) return;
    
    try {
      setIsDeletingAccount(true);
      
      // Slett alle brukerens anmeldelser og tilhørende boliger uten andre reviews
      await deleteUserData(currentUser.uid);
      
      // Slett Firebase Auth brukerkonto
      await deleteUser(currentUser);
      
      router.push("/");
    } catch (err) {
      console.error("Delete account error:", err);
      alert("Kunne ikke slette kontoen. Du må kanskje logge inn på nytt først.");
      setIsDeletingAccount(false);
    }
  };

  // Vis ingenting mens vi sjekker auth state
  if (loading) {
    return null;
  }

  // Hvis innlogget, vis konto-popover med knapper i fete farger
  if (currentUser) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Konto</Button>
        </PopoverTrigger>
        <PopoverContent  align="start" className="w-48 p-2">
          <div className="flex flex-col gap-1">
            <Button 
              type="button" 
              className="bg-gradient-to-r from-blue-800 to-blue-500 text-white hover:opacity-90"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Logger ut..." : "Logg ut"}
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              className="text-left w-full"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
            >
              {isDeletingAccount ? "Sletter..." : "Slett bruker"}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Hvis ikke innlogget, vis login og registrer knapper
  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" >
        <Link href="/login">Logg inn</Link>
      </Button>
      <Button asChild className="bg-blue-700 hover:bg-blue-800 text-white">
        <Link href="/register">Opprett bruker</Link>
      </Button>
    </div>
  );
}
