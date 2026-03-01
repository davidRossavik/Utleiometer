
import { Badge } from "@/ui/feedback/badge"
import { RegisterButton } from "@/features/properties/components/registerButton";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/ui/feedback/card"
import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";
import { SearchBar } from "@/features/search/components/searchBar";
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('HomePage');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {/* TODO: Logo */}
            <div className="h-9 w-9 rounded-xl bg-muted" />
            <span className="font-semibold">Utleiometer</span>
            <WelcomeMessage />
          </div>

          <AuthButtons />
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="container text-center mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-5xl">
            <Badge className="mb-4">
              {/* TODO: liten tagline */}
              For studenter i leiemarkedet
            </Badge>

            <h1 className="text-4xl text-blue-700 font-bold text-center tracking-tight md:text-6xl">
              {/* TODO: Hovedbudskap */}
              {t('title')}
            </h1>
          </div>

        {/* SØKEFELT */}
        <div className="mt-10 flex justify-center">
          <SearchBar placeHolder="Søk etter bolig"/>
        </div>

        {/* REGISTER NEW PROPERTY */}
        <RegisterButton/>

        </section>


        {/* HOW IT WORKS */}
        <section id="how" className="container mx-auto px-4 py-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-semibold tracking-tight">
              {/* TODO */}
              Hvordan det fungerer
            </h2>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-blue-700"> {/* TODO */}Steg 1</CardTitle>
                  <CardDescription>{/* TODO */}Søk etter bolig du vurderer å leie.</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-blue-700"> {/* TODO */}Steg 2</CardTitle>
                  <CardDescription>{/* TODO */}Les andres anmeldelser.</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-blue-700"> {/* TODO */}Steg 3</CardTitle>
                  <CardDescription>{/* TODO */}Ta et informert valg.</CardDescription>
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
          © {new Date().getFullYear()} Utleiometer. Laget av Lillian, Katharina, Robert, David og Marius / PU-gruppe 4.
        </div>
      </footer>
    </div>
  )
}
