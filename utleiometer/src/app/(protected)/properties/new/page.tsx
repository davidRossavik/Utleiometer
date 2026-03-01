import Link from "next/link";

import { Button } from "@/ui/primitives/button";
import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";

import PropertyRegisterClient from "@/features/properties/client/PropertyRegisterClient";

export const metadata = {
  title: "Registrer bolig | Utleiometer",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-muted text-foreground flex flex-col">
      {/* NAV (server wrapper, men med client innslag) */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-muted" />
            <Link href="/" className="font-semibold">
              Utleiometer
            </Link>
            <WelcomeMessage />
          </div>
          <AuthButtons />
        </div>
      </header>

      {/* PAGE CONTENT */}
      <main className="flex-1 flex items-center justify-center p-6 relative">
      {/* Tilbake-knapp – absolutt plassert */}
      <div className="absolute top-6 left-6">
        <Button asChild variant="ghost">
          <Link href="/">← Tilbake</Link>
        </Button>
      </div>

      {/* Sentrert innhold */}
      <div className="w-full max-w-lg flex flex-col items-center gap-6">
        <Link href="/" className="font-bold text-4xl text-blue-700">
          Utleiometer
        </Link>

        <PropertyRegisterClient />
        
      </div>

    </main>

      {/* FOOTER */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Utleiometer. Laget av Lillian, Katharina,
          Robert, David og Marius / PU-gruppe 4.
        </div>
      </footer>
    </div>
  );
}