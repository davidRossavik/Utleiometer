import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";
import ReviewsClient from "@/features/reviews/client/ReviewsClient";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/features/i18n/components/language-switcher";

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
              <div className="h-9 w-9 rounded-xl bg-muted" />
              <span className="font-semibold">{t("brand")}</span>
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