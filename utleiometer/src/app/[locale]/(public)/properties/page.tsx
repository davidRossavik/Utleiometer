import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";
import { LanguageSwitcher } from "@/features/i18n/components/language-switcher";
import { AddReviewHeaderButton } from "@/features/reviews/componentes/AddReviewHeaderButton";

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
            clearFilters: t("clearFilters"),
            areaFilterPlaceholder: t("areaFilterPlaceholder"),
            minRatingPlaceholder: t("minRatingPlaceholder"),
            minRatingValue: t.raw("minRatingValue"),
            minRatingAriaLabel: t("minRatingAriaLabel"),
            sortByLabel: t("sortByLabel"),
            sortByAlphabetical: t("sortByAlphabetical"),
            sortByLatestReview: t("sortByLatestReview"),
            sortByPopularity: t("sortByPopularity"),
            emptyFilteredDescription: t("emptyFilteredDescription"),
            unknownAddress: t("unknownAddress"),
            unknownPlace: t("unknownPlace"),
            seeReviews: t("seeReviews"),
            totalLabel: t("totalLabel"),
            locationLabel: t("locationLabel"),
            noiseLabel: t("noiseLabel"),
            landlordLabel: t("landlordLabel"),
            conditionLabel: t("conditionLabel"),
            notRated: t("notRated"),
            reviewCountLabel: t("reviewCountLabel"),
            propertyTypeLabel: t("propertyTypeLabel"),
            areaSqmLabel: t("areaSqmLabel"),
            buildYearLabel: t("buildYearLabel"),
            notProvided: t("notProvided"),
            propertyTypeHouse: t("propertyTypeHouse"),
            propertyTypeApartment: t("propertyTypeApartment"),
            propertyTypeBedsit: t("propertyTypeBedsit"),
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
