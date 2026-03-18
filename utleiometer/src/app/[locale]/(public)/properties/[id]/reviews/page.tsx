import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";
import ReviewsClient from "@/features/reviews/client/ReviewsClient";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/features/i18n/components/language-switcher";
import { AddReviewHeaderButton } from "@/features/reviews/componentes/AddReviewHeaderButton";
import Image from "next/image";
import Link from "next/link";

export default async function ReviewsPage({ params }: { params: Promise<{ id: string }>}) {
  const { id } = await params;
  const t = await getTranslations("PublicPropertyReviewsPage");
  const tHome = await getTranslations("HomePage");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="border-b">
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
      
      <ReviewsClient
        propertyId={id}
        property={null}
        texts={{
          badge: t("badge"),
          title: t("title"),
          toProperties: t("toProperties"),
          addReview: t("addReview"),
          searchPlaceholder: t("searchPlaceholder"),
          loadingTitle: t("loadingTitle"),
          loadingDescription: t("loadingDescription"),
          emptyTitle: t("emptyTitle"),
          emptyNoMatch: t("emptyNoMatch"),
          emptyNoReviews: t("emptyNoReviews"),
          clearSearch: t("clearSearch"),
          unknownProperty: t("unknownProperty"),
          averageTitle: t("averageTitle"),
          imagesTitle: t("imagesTitle"),
          imagesEmpty: t("imagesEmpty"),
          overallLabel: t("overallLabel"),
          locationLabel: t("locationLabel"),
          noiseLabel: t("noiseLabel"),
          landlordLabel: t("landlordLabel"),
          conditionLabel: t("conditionLabel"),
          notRated: t("notRated"),
          reviewDefaultTitle: t("reviewDefaultTitle"),
          reviewEditTitle: t("reviewEditTitle"),
          reviewEmptyComment: t("reviewEmptyComment"),
          reviewConfirmDelete: t("reviewConfirmDelete"),
          reviewDeleteYes: t("reviewDeleteYes"),
          reviewDeleteNo: t("reviewDeleteNo"),
          reviewEdit: t("reviewEdit"),
          reviewDelete: t("reviewDelete"),
          propertyDetailsTitle: t("propertyDetailsTitle"),
          propertyTypeLabel: t("propertyTypeLabel"),
          areaSqmLabel: t("areaSqmLabel"),
          bedroomsLabel: t("bedroomsLabel"),
          bathroomsLabel: t("bathroomsLabel"),
          floorsLabel: t("floorsLabel"),
          buildYearLabel: t("buildYearLabel"),
          roomAreaSqmLabel: t("roomAreaSqmLabel"),
          hasPrivateBathroomLabel: t("hasPrivateBathroomLabel"),
          otherBedsitsInUnitLabel: t("otherBedsitsInUnitLabel"),
          yes: t("yes"),
          no: t("no"),
          notProvided: t("notProvided"),
          propertyTypeHouse: t("propertyTypeHouse"),
          propertyTypeApartment: t("propertyTypeApartment"),
          propertyTypeBedsit: t("propertyTypeBedsit"),
          reviewSubmittedSuccess: t("messages.reviewSubmittedSuccess"),
          propertySubmittedSuccess: t("messages.propertySubmittedSuccess"),
        }}
        messages={{
          loadReviewsError: t("messages.loadReviewsError"),
        }}
      />

      {/* FOOTER */}
      <footer className="border-t">
          <div className="container mx-auto px-4 py-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {t("footer")}
          </div>
      </footer>
    </div>
    );
}
