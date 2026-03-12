"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { Button } from "@/ui/primitives/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/primitives/popover";
import { signOut, deleteUser } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { deleteUserData } from "@/app/actions/deleteUser";

type Props = {
  account: string,
  confirmText: string,
  alertText: string,
  logOutText: string,
  logOutHandlingText: string,
  deleteText: string,
  deleteHandlingText: string,
  loginText: string,
  registerText: string
}

export function AuthButtons({
  account,
  confirmText,
  alertText,
  logOutText,
  logOutHandlingText,
  deleteText,
  deleteHandlingText,
  loginText,
  registerText
}: Props) {

  const { currentUser, loading, isAdmin } = useAuth();
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
    
    const confirmed = window.confirm(confirmText);
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
      alert(alertText);
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
      <>
        {isAdmin && (
          <Button variant="outline" onClick={() => router.push("/admin")}>
            Admin
          </Button>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">{account}</Button>
          </PopoverTrigger>
          <PopoverContent  align="start" className="w-48 p-2">
            <div className="flex flex-col gap-1">
              <Button 
                type="button" 
                className="bg-gradient-to-r from-blue-800 to-blue-500 text-white hover:opacity-90"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? logOutHandlingText : logOutText}
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                className="text-left w-full"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? deleteHandlingText : deleteText}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </>
    );
  }

  // Hvis ikke innlogget, vis login og registrer knapper
  return (
    <div className="flex items-center gap-2">
      <Button
        asChild
        className="rounded-full border border-blue-500 bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md hover:from-blue-800 hover:to-blue-700"
      >
        <Link href="/register">{registerText}</Link>
      </Button>
      <Button asChild variant="outline" >
        <Link href="/login">{loginText}</Link>
      </Button>
    </div>
  );
}
