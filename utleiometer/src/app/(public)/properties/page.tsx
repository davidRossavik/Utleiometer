import Link from "next/link";

import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";

import PropertiesClient from "@/features/properties/client/PropertiesClient";

export const metadata = {
  title: "Boliger | Utleiometer",
};

export default function PropertiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* NAV */}
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

      {/* CONTENT */}
      <main className="flex-1">
        <PropertiesClient />
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