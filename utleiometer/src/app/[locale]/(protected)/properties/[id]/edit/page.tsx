import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";
import { LanguageSwitcher } from "@/features/i18n/components/language-switcher";
import { AddReviewHeaderButton } from "@/features/reviews/componentes/AddReviewHeaderButton";
import PropertyEditClient from "@/features/properties/client/PropertyEditClient";
import { getPropertyAction } from "@/app/[locale]/actions/properties";

export const metadata = {
  title: "Rediger eiendom | Utleiometer",
};

export default async function Page({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = await params;
  const t = await getTranslations("PropertyEditPage");
  const tHome = await getTranslations("HomePage");

  // Fetch property
  const propertyResult = await getPropertyAction(id);
  if ("error" in propertyResult) {
    return (
      <div className="min-h-screen bg-muted text-foreground flex flex-col">
        <header className="border-b bg-background">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 font-semibold">
                <div className="topbar-logo h-10 w-10">
                  <Image
                    src="/logo.png"
                    alt={`${t("brand")} logo`}
                    width={64}
                    height={64}
                    className="topbar-logo-image h-full w-full"
                    priority
                  />
                </div>
                <span>{t("brand")}</span>
              </Link>
              <WelcomeMessage text={tHome("welcomeMessage")} />
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-600">Eiendom ikke funnet</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted text-foreground flex flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 font-semibold">
              <div className="topbar-logo h-10 w-10">
                <Image
                  src="/logo.png"
                  alt={`${t("brand")} logo`}
                  width={64}
                  height={64}
                  className="topbar-logo-image h-full w-full"
                  priority
                />
              </div>
              <span>{t("brand")}</span>
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

      <main className="relative flex-1 overflow-hidden bg-gradient-to-br from-blue-50 via-background to-blue-100/70 p-6">
        <PropertyEditClient property={propertyResult} />
      </main>
    </div>
  );
}
