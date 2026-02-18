"use client"


import { useRouter } from "next/navigation"
import { useState } from "react"

import Link from "next/link"
import { Button } from "@/ui/primitives/button"
import { Badge } from "@/ui/feedback/badge"
import { Field, FieldDescription, FieldLabel } from "@/ui/primitives/field"
import { Input } from "@/ui/primitives/input"
import { useAuth } from "@/features/auth/hooks/useAuth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/feedback/card"

import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";

export default function Home() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const { currentUser, loading } = useAuth()


  
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
              Utleiometer
            </h1>
          </div>

        {/* SØKEFELT */}
        <div className="mt-10 flex justify-center">
        <form className="mt-10 flex justify-center w-full"
        onSubmit={(e) => {
          e.preventDefault()
          const q = search.trim()
          router.push(q ? `/properties?q=${encodeURIComponent(q)}` : "/properties")
        }}
        >
        <Input
            id="search-bar"
            placeholder="Søk etter bolig"
            className="h-16 w-full max-w-2xl text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />
        </form>
        </div>

        {/* REGISTER NEW PROPERTY */}
        {currentUser && (
        <div className="mt-10 text-center">
          <p className="text-muted-foreground mb-3">
            Finner du ikke boligen du ønsker å vurdere? 
          </p>
          <Link href="/properties/register">
            <Button variant="outline" size="lg" className="text-base">
              Registrer ny bolig her
            </Button>
          </Link>
        </div>)}
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
