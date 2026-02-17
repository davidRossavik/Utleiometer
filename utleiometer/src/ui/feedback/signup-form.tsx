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
import type { RegisterField } from "@/features/auth/hooks/useRegisterForm";

type SignupFormProps = Omit<React.ComponentProps<"div">, "onChange" | "onBlur" | "onSubmit"> & {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  errors: Record<RegisterField, string>;
  touched: Record<RegisterField, boolean>;
  onChange: (field: RegisterField, value: string) => void;
  onBlur: (field: RegisterField, value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function SignupForm({
  className,
  username,
  email,
  password,
  confirmPassword,
  errors, 
  touched, 
  onChange, 
  onBlur,
  onConfirmPasswordChange,
  onSubmit,
  ...props
}: SignupFormProps) {
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
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Brukernavn</FieldLabel>
                <Input 
                  id="name"
                  type="text"
                  placeholder="Ola_Nordmann"
                  required
                  value={username}
                  onChange={(e) => onChange("username", e.target.value)}
                  onBlur={(e) => onBlur("username", (e.target as HTMLInputElement).value)}
                />
                {touched.username && errors.username ? (
                  <FieldDescription className="text-red-600">
                    {errors.username}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">E-post</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="ola.nordmann@example.com"
                  required
                  value={email}
                  onChange={(e) => onChange("email", e.target.value)}
                  onBlur={(e) => onBlur("email", (e.target as HTMLInputElement).value)}
                />
                {touched.email && errors.email ? (
                  <FieldDescription className="text-red-600">
                    {errors.email}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Passord</FieldLabel>
                    <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => onChange("password", e.target.value)}
                    onBlur={(e) => onBlur("password", (e.target as HTMLInputElement).value)}
                    />
                    {touched.password && errors.password ? (
                      <FieldDescription className="text-red-600">
                        {errors.password}
                      </FieldDescription>
                    ) : null}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Bekreft passord
                    </FieldLabel>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      required 
                      value={confirmPassword}
                      onChange={(e) => onConfirmPasswordChange(e.target.value)}
                      />
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
