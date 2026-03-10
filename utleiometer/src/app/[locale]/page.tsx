
import { Badge } from "@/ui/feedback/badge"
import { RegisterButton } from "@/features/properties/components/registerButton";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/ui/feedback/card"
import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";
import { SearchBar } from "@/features/search/components/searchBar";
import { LanguageSwitcher } from "@/features/i18n/components/language-switcher";
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
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {/* TODO: Logo */}
            <div className="h-9 w-9 rounded-xl bg-muted" />
            <span className="font-semibold">{t("title")}</span>
            <WelcomeMessage text={t("welcomeMessage")}/>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
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
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="container text-center mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-5xl">
            <Badge className="mb-4">
              {/* TODO: liten tagline */}
              {t("targetAudience")}
            </Badge>

            <h1 className="text-4xl text-blue-700 font-bold text-center tracking-tight md:text-6xl">
              {/* TODO: Hovedbudskap */}
              {t('title')}
            </h1>
          </div>

        {/* SØKEFELT */}
        <div className="mt-10 flex justify-center">
          <SearchBar
            placeHolder={t("searchPlaceholder")}
            submitLabel={t("searchButton")}
          />
        </div>

        {/* REGISTER NEW PROPERTY */}
        <RegisterButton 
          registerMessage={t("registerMessage")}
          registerButtonText={t("registerButtonText")}
        />

        </section>


        {/* HOW IT WORKS */}
        <section id="how" className="container mx-auto px-4 py-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              {/* TODO */}
              {t("flowDescription")}
            </h2>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-blue-700"> {/* TODO */}{t("step1")}</CardTitle>
                  <CardDescription>{/* TODO */}{t("step1Description")}</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-blue-700"> {/* TODO */}{t("step2")}</CardTitle>
                  <CardDescription>{/* TODO */}{t("step2Description")}</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-blue-700"> {/* TODO */}{t("step3")}</CardTitle>
                  <CardDescription>{/* TODO */}{t("step3Description")}</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
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
