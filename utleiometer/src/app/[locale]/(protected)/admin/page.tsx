import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";
import { LanguageSwitcher } from "@/features/i18n/components/language-switcher";
import { AddReviewHeaderButton } from "@/features/reviews/componentes/AddReviewHeaderButton";

import AdminPageClient from "./AdminPageClient";

export const metadata = {
  title: "Admin | Utleiometer",
};

export default async function AdminPage() {
  const tHome = await getTranslations("HomePage");

  return (
    <div className="min-h-screen bg-muted text-foreground flex flex-col">
      {/* NAV */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 font-semibold">
              <div className="topbar-logo h-10 w-10">
                <Image
                  src="/logo.png"
                  alt="Utleiometer logo"
                  width={64}
                  height={64}
                  className="topbar-logo-image h-full w-full"
                  priority
                />
              </div>
              <span>{tHome("title")}</span>
            </Link>
            <WelcomeMessage text={tHome("welcomeMessage")} />
          </div>
          <div className="flex items-center gap-2">
            <AddReviewHeaderButton label={tHome("addReviewButton")} />
            <AuthButtons
              account={tHome("account")}
              confirmText={tHome("confirmText")}
              alertText={tHome("alertText")}
              logOutText={tHome("logOutText")}
              logOutHandlingText={tHome("logOutHandlingText")}
              deleteText={tHome("deleteText")}
              deleteHandlingText={tHome("deleteHandlingText")}
              loginText={tHome("loginText")}
              registerText={tHome("registerText")}
            />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="relative flex-1 overflow-hidden bg-gradient-to-br from-blue-50 via-background to-blue-100/70 p-6">
        <div aria-hidden className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-blue-200/45 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-20 top-16 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
        <AdminPageClient />
      </main>
    </div>
  );
}
