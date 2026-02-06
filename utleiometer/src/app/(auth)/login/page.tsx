import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/dist/client/link"

export function CardDemo() {
  return (
    <div className="bg-muted flex w-full max-w-sm flex-col items-center gap-6">
      {/* BLÅ TEKST OVER */}
      <a
        href="/"
        className="font-bold text-4xl text-blue-700"
      >
        Utleiometer
      </a>

      {/* LOGIN CARD */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Innlogging</CardTitle>
          <CardDescription>
            Skriv inn din e-postadresse for å logge inn
          </CardDescription>
          <CardAction>         
          </CardAction>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">E-post</Label>
              <Input id="email" type="email" placeholder="ola.nordmann@eksempel.com" required />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Passord</Label>
              </div>
              <Input id="password" type="password" required />
            </div>

            <Button type="submit" className="w-full">
              Logg inn
            </Button>
            <Field>
                <FieldDescription className="text-center">
                  Har du ikke en konto? <a href="/register">Registrer deg her</a>
                </FieldDescription>
              </Field>
          </form>
        </CardContent>

        <CardFooter />
      </Card>
    </div>
  )
}

export default function Home() {
  return (
    <main className="bg-muted min-h-screen flex items-center justify-center p-6">
      <CardDemo />
    </main>
  )
}
