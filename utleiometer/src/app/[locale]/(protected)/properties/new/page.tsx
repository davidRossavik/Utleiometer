import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";
import { LanguageSwitcher } from "@/features/i18n/components/language-switcher";
import { AddReviewHeaderButton } from "@/features/reviews/componentes/AddReviewHeaderButton";

import PropertyRegisterClient from "@/features/properties/client/PropertyRegisterClient";

export const metadata = {
  title: "Legg til anmeldelse | Utleiometer",
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

      {/* PAGE CONTENT */}
      <main className="relative flex-1 overflow-hidden bg-gradient-to-br from-blue-50 via-background to-blue-100/70 p-6">
        <div aria-hidden className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-blue-200/45 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-20 top-16 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />

        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6">
          <Link href="/" className="font-bold text-4xl text-blue-700 drop-shadow-sm transition-colors hover:text-blue-800">
            {t("brand")}
          </Link>

          <PropertyRegisterClient
            texts={{
            cardTitle: t("form.cardTitle"),
            cardDescription: t("form.cardDescription"),
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
            addressStepTitle: t("form.addressStepTitle"),
            propertyDetailsStepTitle: t("form.propertyDetailsStepTitle"),
            reviewStepTitle: t("form.reviewStepTitle"),
            propertyFoundMessage: t("form.propertyFoundMessage"),
            propertyNotFoundMessage: t("form.propertyNotFoundMessage"),
            continueButton: t("form.continueButton"),
            cancelButton: t("form.cancelButton"),
            submitButton: t("form.submitButton"),
            submittingButton: t("form.submittingButton"),
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
