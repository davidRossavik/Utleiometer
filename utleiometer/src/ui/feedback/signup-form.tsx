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

export type SignupFormTexts = {
  title: string;
  description: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  passwordHint: string;
  submit: string;
  hasAccount: string;
  loginLink: string;
  termsPrefix: string;
  termsLink: string;
  andText: string;
  privacyLink: string;
};

const defaultTexts: SignupFormTexts = {
  title: "Opprett bruker",
  description: "Skriv inn e-posten din nedenfor for å opprette en konto",
  usernameLabel: "Brukernavn",
  usernamePlaceholder: "Ola_Nordmann",
  emailLabel: "E-post",
  emailPlaceholder: "ola.nordmann@example.com",
  passwordLabel: "Passord",
  confirmPasswordLabel: "Bekreft passord",
  passwordHint: "Må være minst 8 tegn langt.",
  submit: "Opprett bruker",
  hasAccount: "Har du allerede en konto?",
  loginLink: "Logg inn",
  termsPrefix: "Ved å klikke fortsett, godtar du våre",
  termsLink: "Vilkår for bruk",
  andText: "og",
  privacyLink: "Personvernregler",
};

type SignupFormProps = Omit<React.ComponentProps<"div">, "onChange" | "onBlur" | "onSubmit"> & {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  errors: Record<RegisterField, string>;
  touched: Record<RegisterField, boolean>;
  onChange: (field: RegisterField, value: string) => void;
  onBlur: (field: RegisterField, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  texts?: SignupFormTexts;
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
  onSubmit,
  texts = defaultTexts,
  ...props
}: SignupFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{texts.title}</CardTitle>
          <CardDescription>
            {texts.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">{texts.usernameLabel}</FieldLabel>
                <Input 
                  id="name"
                  type="text"
                  placeholder={texts.usernamePlaceholder}
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
                <FieldLabel htmlFor="email">{texts.emailLabel}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder={texts.emailPlaceholder}
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
                    <FieldLabel htmlFor="password">{texts.passwordLabel}</FieldLabel>
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
                      {texts.confirmPasswordLabel}
                    </FieldLabel>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      required 
                      value={confirmPassword}
                      onChange={(e) => onChange("confirmPassword", e.target.value)}
                      onBlur={(e) => onBlur("confirmPassword", (e.target as HTMLInputElement).value)}
                      />
                    {touched.confirmPassword && errors.confirmPassword ? (
                      <FieldDescription className="text-red-600">
                        {errors.confirmPassword}
                      </FieldDescription>
                    ) : null}
                  </Field>
                </Field>
                <FieldDescription>
                  {texts.passwordHint}
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit">{texts.submit}</Button>
                <FieldDescription className="text-center">
                  {texts.hasAccount} <a href="/login">{texts.loginLink}</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        {texts.termsPrefix} <a href="#">{texts.termsLink}</a>{" "}
        {texts.andText} <a href="#">{texts.privacyLink}</a>.
      </FieldDescription>
    </div>
  )
}
