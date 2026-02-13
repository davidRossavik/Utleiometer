// Receives an ID-token from the client, uses it to create a secure session cookie,
// and puts this cookie in the users browser

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";

export async function POST(request: Request) {
    try {
        const { authIdToken } = await request.json()

        if (!authIdToken) {
            return NextResponse.json({ message: "Auth ID mangler i forespørselen."}, { status: 400 });
        }

        // --- Opprettelse av Session Cookie ---
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 dager i millisekund
        const sessionCookie = await adminAuth.createSessionCookie(authIdToken, { expiresIn });

        (await cookies()).set({ // Sett session cookie i brukerens nettleser
            name: "__session",
            value: sessionCookie,
            httpOnly: true,         // Gjør cookie utilgjengelig for klient-side (beskytter mot Cross-Site Scripting)
            secure: process.env.NODE_ENV === "production",
            maxAge: expiresIn / 1000,
            path: "/",
            sameSite: "lax",
        });

        return NextResponse.json({ status: "suksess", message: "Innlogging vellykket, session cookie satt."}, { status: 200});

    } catch (error) {
        console.error("Feil ved opprettelse av session cookie i /api/login:", error);
        return NextResponse.json({ message: "Innlogging feilet på serveren."}, {status: 500});
    }
}