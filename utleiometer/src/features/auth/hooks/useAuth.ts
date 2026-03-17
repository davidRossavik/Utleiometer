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
        let isMounted = true;

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (!isMounted) return;

            setCurrentUser(user);
            setLoading(false);

            if (!user) {
                setIsUserAdmin(false);
                return;
            }

            try {
                const adminStatus = await isAdmin(user);
                if (!isMounted) return;
                setIsUserAdmin(adminStatus);
            } catch {
                if (!isMounted) return;
                setIsUserAdmin(false);
            }
        });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, []);

    return { currentUser, loading, isAdmin: isUserAdmin };
}

