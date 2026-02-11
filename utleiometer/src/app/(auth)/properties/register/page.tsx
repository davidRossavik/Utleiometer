"use client"

import { Button } from "@/ui/primitives/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/feedback/card"
import { Field, FieldDescription } from "@/ui/primitives/field"
import { Input } from "@/ui/primitives/input"
import { Label } from "@/ui/primitives/label"
import Link from "next/link"

export default function PropertyRegisterPage() {
  return (
    <main className="bg-muted min-h-screen flex items-center justify-center p-6">
      <div className="flex w-full max-w-lg flex-col items-center gap-6">
        <Link href="/" className="font-bold text-4xl text-blue-700">
          Utleiometer
        </Link>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">Registrer og anmeld bolig</CardTitle>
            <CardDescription>
              Registrer adressen og del din erfaring
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              className="flex flex-col gap-8"
              onSubmit={(e) => e.preventDefault()}
            >

              {/* === 1. REGISTRER BOLIG === */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold">
                  📍 Registrer bolig
                </h3>

                <div className="grid gap-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="F.eks. Elgeseter gate 1, Trondheim"
                    required
                  />
                </div>
              </div>

              <div className="border-t" />

              {/* === 2. ANMELDELSE AV BOLIG === */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold">
                  🏠 Anmeld bolig
                </h3>

                <div className="grid gap-2">
                  <Label htmlFor="review_property">
                    Beskriv boligen
                  </Label>
                  <textarea
                    id="review_property"
                    placeholder="F.eks. Stille nabolag, litt langt fra sentrum"
                    className="min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="rating_property">
                    Vurdering (1–5)
                  </Label>
                  <Input
                    id="rating_property"
                    type="number"
                    min={1}
                    max={5}
                    step={1}
                    placeholder="3"
                    required
                  />
                </div>
              </div>

              <div className="border-t" />

              {/* === 3. ANMELDELSE AV UTLEIER === */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold">
                  👤 Anmeld utleier
                </h3>

                <div className="grid gap-2">
                  <Label htmlFor="review_landlord">
                    Beskriv utleier
                  </Label>
                  <textarea
                    id="review_landlord"
                    placeholder="F.eks. Hyggelig, men lite tilgjengelig"
                    className="min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="rating_landlord">
                    Vurdering (1–5)
                  </Label>
                  <Input
                    id="rating_landlord"
                    type="number"
                    min={1}
                    max={5}
                    step={1}
                    placeholder="3"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Registrer bolig
              </Button>

              <Field>
                <FieldDescription className="text-center">
                  Du kan redigere anmeldelsen senere
                </FieldDescription>
              </Field>
            </form>
          </CardContent>

          <CardFooter />
        </Card>
      </div>
    </main>
  )
}
