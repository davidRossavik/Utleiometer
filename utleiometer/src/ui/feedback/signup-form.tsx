import { cn } from "@/lib/utils"
import { Button } from "@/ui/primitives/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/feedback/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/ui/primitives/field"
import { Input } from "@/ui/primitives/input"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Opprett bruker</CardTitle>
          <CardDescription>
            Skriv inn e-posten din nedenfor for å opprette en konto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Fullt navn</FieldLabel>
                <Input id="name" type="text" placeholder="Ola Nordmann" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">E-post</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="ola.nordmann@example.com"
                  required
                />
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Passord</FieldLabel>
                    <Input id="password" type="password" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Bekreft passord
                    </FieldLabel>
                    <Input id="confirm-password" type="password" required />
                  </Field>
                </Field>
                <FieldDescription>
                  Må være minst 8 tegn langt.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit">Opprett bruker</Button>
                <FieldDescription className="text-center">
                  Har du allerede en konto? <a href="/login">Logg inn</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Ved å klikke fortsett, godtar du våre <a href="#">Vilkår for bruk</a>{" "}
        og <a href="#">Personvernregler</a>.
      </FieldDescription>
    </div>
  )
}
