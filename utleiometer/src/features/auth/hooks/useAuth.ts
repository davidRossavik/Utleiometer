// Hook som lar klient-komponenter lytte etter autentiseringsendringer
"use client";

import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { isAdmin } from "@/lib/auth";

/**
 * En React Hook for å få den autentiserte brukeren i klient-side komponenter
 * Gir status for om brukeren er innlogget, om autentisering sjekkes, og om brukeren er admin.
 * Dette er primær måte klient komponentene får tilgang til autentiseringstilstanden
 * 
 * @returns Et objekt med currentUser (brukerobjekt eller null), loading (boolean), og isAdmin (boolean)
 */
export function useAuth() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUserAdmin, setIsUserAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setCurrentUser(user);
            
            // Check admin status
            if (user) {
                const adminStatus = await isAdmin(user);
                setIsUserAdmin(adminStatus);
            } else {
                setIsUserAdmin(false);
            }
            
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { currentUser, loading, isAdmin: isUserAdmin };
}

