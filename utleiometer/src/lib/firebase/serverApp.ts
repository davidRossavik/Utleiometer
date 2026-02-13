// Authentication for server components

import { adminAuth } from "@/lib/firebase/admin";
import { User } from "firebase/auth";

// Interface for brukerobjekt som server-komponenter vil motta
interface ServerUser {
    uid: string;
    email: string | null;
    displayName: string | null;
}

/**
 * Henter autentisert brukerinformasjon fra en firebase Session Cookie
 * Funksjon ment for bruk i server components
 * 
 * @param sessionCookie. Den sikre HTTP-only session cookien fra users browser
 * @returns et ServerUser-objekt hvis brukeren er autentisert og cookie gyldig. (ellers null)
 */
export async function getAuthenticatedUserFromSession(sessionCookie?: string): Promise<ServerUser | null> {
    if (!sessionCookie) {
        return null;
    }

    try {
        // Verify session cookie with Firebase Admin SDK
        // Also checks if the token is revoked
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

        return {
            uid: decodedClaims.uid,
            email: decodedClaims.email || null,
            displayName: decodedClaims.name || null,
        };
    } catch (error) {
        console.error("Feil ved verifisering av session cookie", error);
        return null;
    }
}

