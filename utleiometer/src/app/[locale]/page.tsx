
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/ui/feedback/badge"
import { PopularPropertiesSection } from "@/features/properties/components/popularPropertiesSection";
import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";
import { SearchBar } from "@/features/search/components/searchBar";
import { LanguageSwitcher } from "@/features/i18n/components/language-switcher";
import { AddReviewHeaderButton } from "@/features/reviews/componentes/AddReviewHeaderButton";
import { useTranslations } from 'next-intl';
import { setRequestLocale } from "next-intl/server";
import { use } from 'react';

type Props = {
  params: Promise<{locale: string}>;
}

export default function Home({params}: Props) {
  const {locale} = use(params);
  setRequestLocale(locale);
  const t = useTranslations('HomePage');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="topbar-shell border-b">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="topbar-brand-chip flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="topbar-logo h-10 w-10">
                <Image
                  src="/logo.png"
                  alt={`${t("title")} logo`}
                  width={64}
                  height={64}
                  className="topbar-logo-image h-full w-full"
                  priority
                />
              </div>
              <span className="topbar-title text-sm font-semibold tracking-tight md:text-base">{t("title")}</span>
            </Link>
            <WelcomeMessage text={t("welcomeMessage")}/>
          </div>

          <div className="topbar-actions flex w-full items-center justify-end gap-2 sm:w-auto">
            <AddReviewHeaderButton label={t("addReviewButton")} />
            <AuthButtons 
              account={t("account")}
              confirmText={t("confirmText")}
              alertText={t("alertText")}
              logOutText={t("logOutText")}
              logOutHandlingText={t("logOutHandlingText")}
              deleteText={t("deleteText")}
              deleteHandlingText={t("deleteHandlingText")}
              loginText={t("loginText")}
              registerText={t("registerText")}
            />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="landing-main-bg relative isolate overflow-hidden">
        <div aria-hidden className="landing-orb landing-orb--left" />
        <div aria-hidden className="landing-orb landing-orb--right" />
        <div aria-hidden className="landing-dot-pattern" />

        {/* HERO */}
        <section className="landing-hero-layer container mx-auto px-4 py-20 md:py-28">
          <div className="landing-hero-panel mx-auto max-w-5xl px-6 py-10 text-center md:px-10 md:py-14">
            <div className="mx-auto max-w-4xl">
              <Badge className="mb-6 border-blue-200 bg-blue-100/80 px-3 py-1 text-blue-800">
                {/* TODO: liten tagline */}
                {t("targetAudience")}
              </Badge>

              <h1 className="text-balance text-4xl font-bold tracking-tight text-blue-700 md:text-6xl">
                {/* TODO: Hovedbudskap */}
                {t('title')}
              </h1>
            </div>

            {/* SØKEFELT */}
            <div className="mt-8 flex justify-center md:mt-10">
              <SearchBar
                placeHolder={t("searchPlaceholder")}
                submitLabel={t("searchButton")}
              />
            </div>
          </div>
        </section>

        <PopularPropertiesSection
          texts={{
            title: t("popularPropertiesTitle"),
            emptyDescription: t("popularPropertiesEmpty"),
            imagePlaceholder: t("popularPropertiesImagePlaceholder"),
            ratingLabel: t("popularPropertiesRatingLabel"),
            propertyTypeLabel: t("popularPropertiesPropertyTypeLabel"),
            areaSqmLabel: t("popularPropertiesAreaLabel"),
            notProvided: t("popularPropertiesNotProvided"),
            propertyTypeHouse: t("propertyTypeHouse"),
            propertyTypeApartment: t("propertyTypeApartment"),
            propertyTypeBedsit: t("propertyTypeBedsit"),
            notRated: t("popularPropertiesNotRated"),
          }}
          messages={{
            loadPropertiesError: t("messages.loadPropertiesError"),
          }}
        />
      </main>

      {/* FOOTER */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-10 text-sm text-muted-foreground">
          {/* TODO */}
          © {new Date().getFullYear()} {t("footer")}
        </div>
      </footer>
    </div>
  )
}
