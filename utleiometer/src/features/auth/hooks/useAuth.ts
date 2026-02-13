// Hook som lar klient-komponenter lytte etter autentiseringsendringer
"use client";

import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

/**
 * En React Hook for å få den autentiserte brukeren i klient-side komponenter
 * Gir status for om brukeren er innlogget, og om autentisering sjekkes.
 * Dette er primær måte klient komponentene får tilgang til autentiseringstilstanden
 * 
 * @returns Et objekt med currentUser (brukerobjekt eller null) og loading (boolean)
 */
export function useAuth() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { currentUser, loading };
}

