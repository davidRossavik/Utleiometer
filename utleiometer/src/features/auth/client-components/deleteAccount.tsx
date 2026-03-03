import { signOut, deleteUser } from "firebase/auth";
import { useState } from "react";
import { User } from "firebase/auth";
import { NextRouter } from "next/router";

export default function DeleteAccount({ currentUser, router }: { currentUser: User | null; router: NextRouter }) {
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    
    // bekreftelse før sletting
    const confirmed = window.confirm(
      "Er du sikker på at du vil slette kontoen din? Dette kan ikke angres."
    );
    
    if (!confirmed) return;
    
    try {
      setIsDeletingAccount(true);
      
      // Firebase deleteUser krever at det finnes et bruker-objekt
      await deleteUser(currentUser);
      
      //Redirect til forsiden etter sletting
      router.push("/");
    } catch (err) {
      console.error("Delete account error:", err);
      alert("Kunne ikke slette kontoen. Du må kanskje logge inn på nytt først.");
      setIsDeletingAccount(false);
    }
  };

  
}
