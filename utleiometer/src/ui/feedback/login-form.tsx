import Link from "next/link";
import { Button } from "@/ui/primitives/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/feedback/card";
import { Field, FieldDescription } from "@/ui/primitives/field";
import { Input } from "@/ui/primitives/input";
import { Label } from "@/ui/primitives/label";

type LoginField = "email" | "password";

export type LoginFormTexts = {
  brand: string;
  title: string;
  description: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  submit: string;
  submitting: string;
  noAccount: string;
  registerLink: string;
};

const defaultTexts: LoginFormTexts = {
  brand: "Utleiometer",
  title: "Innlogging",
  description: "Skriv inn din e-postadresse for å logge inn",
  emailLabel: "E-post",
  emailPlaceholder: "ola.nordmann@eksempel.com",
  passwordLabel: "Passord",
  submit: "Logg inn",
  submitting: "Logger inn...",
  noAccount: "Har du ikke en konto?",
  registerLink: "Registrer deg her",
};

type LoginFormUIProps = {
  email: string;
  password: string;
  errors: Record<LoginField, string>;
  touched: Record<LoginField, boolean>;
  formError?: string;
  onChange: (field: LoginField, value: string) => void;
  onBlur: (field: LoginField, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  texts?: LoginFormTexts;
};

export function LoginFormUI({
  email,
  password,
  errors,
  touched,
  formError,
  onChange,
  onBlur,
  onSubmit,
  isSubmitting,
  texts = defaultTexts,
}: LoginFormUIProps) {
  return (
    <div className="bg-muted flex w-full max-w-sm flex-col items-center gap-6">
      {/* BLÅ TEKST OVER */}
      <Link href="/" className="font-bold text-4xl text-blue-700">
        {texts.brand}
      </Link>

      {/* LOGIN CARD */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">{texts.title}</CardTitle>
          <CardDescription>
            {texts.description}
          </CardDescription>
          <CardAction />
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">{texts.emailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder={texts.emailPlaceholder}
                required
                value={email}
                onChange={(e) => onChange("email", e.target.value)}
                onBlur={(e) => onBlur("email", (e.target as HTMLInputElement).value)}
                disabled={isSubmitting}
              />
              {touched.email && errors.email ? (
                <FieldDescription className="text-red-600">
                  {errors.email}
                </FieldDescription>
              ) : null}
            </div>

            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">{texts.passwordLabel}</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => onChange("password", e.target.value)}
                onBlur={(e) => onBlur("password", (e.target as HTMLInputElement).value)}
                disabled={isSubmitting}
              />
              {touched.password && errors.password ? (
                <FieldDescription className="text-red-600">
                  {errors.password}
                </FieldDescription>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              { isSubmitting ? texts.submitting : texts.submit}
            </Button>

            {formError ? (
              <FieldDescription className="text-red-600 text-center">
                {formError}
              </FieldDescription>
            ) : null}

            <Field>
              <FieldDescription className="text-center">
                {texts.noAccount}{" "}
                <Link href="/register" className="underline">
                  {texts.registerLink}
                </Link>
              </FieldDescription>
            </Field>
          </form>
        </CardContent>

        <CardFooter />
      </Card>
    </div>
  );
}
