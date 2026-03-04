import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";
import { LanguageSwitcher } from "@/features/i18n/components/language-switcher";

import PropertiesClient from "@/features/properties/client/PropertiesClient";

export const metadata = {
  title: "Boliger | Utleiometer",
};

export default async function PropertiesPage() {
  const t = await getTranslations("PublicPropertiesPage");
  const tHome = await getTranslations("HomePage");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* NAV */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-muted" />
            <Link href="/" className="font-semibold">
              {t("brand")}
            </Link>
            <WelcomeMessage text={tHome("welcomeMessage")} />
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
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
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1">
        <PropertiesClient
          texts={{
            badge: t("badge"),
            title: t("title"),
            subtitle: t("subtitle"),
            homeButton: t("homeButton"),
            searchPlaceholder: t("searchPlaceholder"),
            loadingTitle: t("loadingTitle"),
            loadingDescription1: t("loadingDescription1"),
            loadingDescription2: t("loadingDescription2"),
            emptyTitle: t("emptyTitle"),
            emptyDescription: t("emptyDescription"),
            clearSearch: t("clearSearch"),
            unknownAddress: t("unknownAddress"),
            unknownPlace: t("unknownPlace"),
            seeReviews: t("seeReviews"),
          }}
          messages={{
            loadPropertiesError: t("messages.loadPropertiesError"),
          }}
        />
      </main>

      {/* FOOTER */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {t("footer")}
        </div>
      </footer>
    </div>
  );
}