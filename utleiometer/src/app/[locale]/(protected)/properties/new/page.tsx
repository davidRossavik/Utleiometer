import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/ui/primitives/button";
import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";
import { LanguageSwitcher } from "@/features/i18n/components/language-switcher";

import PropertyRegisterClient from "@/features/properties/client/PropertyRegisterClient";

export const metadata = {
  title: "Registrer bolig | Utleiometer",
};

export default async function Page() {
  const t = await getTranslations("PropertyNewPage");
  const tHome = await getTranslations("HomePage");

  return (
    <div className="min-h-screen bg-muted text-foreground flex flex-col">
      {/* NAV (server wrapper, men med client innslag) */}
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

      {/* PAGE CONTENT */}
      <main className="flex-1 flex items-center justify-center p-6 relative">
      {/* Tilbake-knapp – absolutt plassert */}
      <div className="absolute top-6 left-6">
        <Button asChild variant="ghost">
          <Link href="/">{t("backButton")}</Link>
        </Button>
      </div>

      {/* Sentrert innhold */}
      <div className="w-full max-w-lg flex flex-col items-center gap-6">
        <Link href="/" className="font-bold text-4xl text-blue-700">
          {t("brand")}
        </Link>

        <PropertyRegisterClient
          texts={{
            cardTitle: t("form.cardTitle"),
            cardDescription: t("form.cardDescription"),
            sectionRegisterTitle: t("form.sectionRegisterTitle"),
            addressLabel: t("form.addressLabel"),
            addressPlaceholder: t("form.addressPlaceholder"),
            zipCodeLabel: t("form.zipCodeLabel"),
            zipCodePlaceholder: t("form.zipCodePlaceholder"),
            cityLabel: t("form.cityLabel"),
            cityPlaceholder: t("form.cityPlaceholder"),
            propertyTypeLabel: t("form.propertyTypeLabel"),
            propertyTypeHouse: t("form.propertyTypeHouse"),
            propertyTypeApartment: t("form.propertyTypeApartment"),
            propertyTypeBedsit: t("form.propertyTypeBedsit"),
            areaSqmLabel: t("form.areaSqmLabel"),
            areaSqmPlaceholder: t("form.areaSqmPlaceholder"),
            bedroomsLabel: t("form.bedroomsLabel"),
            bedroomsPlaceholder: t("form.bedroomsPlaceholder"),
            bathroomsLabel: t("form.bathroomsLabel"),
            bathroomsPlaceholder: t("form.bathroomsPlaceholder"),
            floorsLabel: t("form.floorsLabel"),
            floorsPlaceholder: t("form.floorsPlaceholder"),
            buildYearLabel: t("form.buildYearLabel"),
            buildYearPlaceholder: t("form.buildYearPlaceholder"),
            roomAreaSqmLabel: t("form.roomAreaSqmLabel"),
            roomAreaSqmPlaceholder: t("form.roomAreaSqmPlaceholder"),
            hasPrivateBathroomLabel: t("form.hasPrivateBathroomLabel"),
            hasPrivateBathroomYes: t("form.hasPrivateBathroomYes"),
            hasPrivateBathroomNo: t("form.hasPrivateBathroomNo"),
            otherBedsitsInUnitLabel: t("form.otherBedsitsInUnitLabel"),
            otherBedsitsInUnitPlaceholder: t("form.otherBedsitsInUnitPlaceholder"),
            sectionReviewTitle: t("form.sectionReviewTitle"),
            commentLabel: t("form.commentLabel"),
            commentPlaceholder: t("form.commentPlaceholder"),
            ratingsTitle: t("form.ratingsTitle"),
            locationLabel: t("form.locationLabel"),
            locationHelp: t("form.locationHelp"),
            noiseLabel: t("form.noiseLabel"),
            noiseHelp: t("form.noiseHelp"),
            landlordLabel: t("form.landlordLabel"),
            landlordHelp: t("form.landlordHelp"),
            conditionLabel: t("form.conditionLabel"),
            conditionHelp: t("form.conditionHelp"),
            submit: t("form.submit"),
            submitting: t("form.submitting"),
            hint: t("form.hint"),
          }}
          messages={{
            notLoggedIn: t("messages.notLoggedIn"),
            unknownError: t("messages.unknownError"),
          }}
        />
        
      </div>

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
