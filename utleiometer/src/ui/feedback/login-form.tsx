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
}: LoginFormUIProps) {
  return (
    <div className="bg-muted flex w-full max-w-sm flex-col items-center gap-6">
      {/* BLÅ TEKST OVER */}
      <Link href="/" className="font-bold text-4xl text-blue-700">
        Utleiometer
      </Link>

      {/* LOGIN CARD */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Innlogging</CardTitle>
          <CardDescription>
            Skriv inn din e-postadresse for å logge inn
          </CardDescription>
          <CardAction />
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                placeholder="ola.nordmann@eksempel.com"
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
                <Label htmlFor="password">Passord</Label>
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
              { isSubmitting ? "Logger inn..." : "Logg inn"}
            </Button>

            {formError ? (
              <FieldDescription className="text-red-600 text-center">
                {formError}
              </FieldDescription>
            ) : null}

            <Field>
              <FieldDescription className="text-center">
                Har du ikke en konto?{" "}
                <Link href="/register" className="underline">
                  Registrer deg her
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
