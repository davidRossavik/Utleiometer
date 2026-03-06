import { LoginForm } from "@/features/auth/client-components/loginForm";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("LoginPage");

  return (
    <main className="bg-muted min-h-screen flex items-center justify-center p-6">
      <LoginForm
        texts={{
          brand: t("brand"),
          title: t("title"),
          description: t("description"),
          emailLabel: t("emailLabel"),
          emailPlaceholder: t("emailPlaceholder"),
          passwordLabel: t("passwordLabel"),
          submit: t("submit"),
          submitting: t("submitting"),
          noAccount: t("noAccount"),
          registerLink: t("registerLink"),
        }}
        messages={{
          emailRequired: t("errors.emailRequired"),
          emailInvalid: t("errors.emailInvalid"),
          passwordRequired: t("errors.passwordRequired"),
          passwordInvalid: t("errors.passwordInvalid"),
          invalidCredential: t("errors.invalidCredential"),
          invalidEmailFirebase: t("errors.invalidEmailFirebase"),
          tooManyRequests: t("errors.tooManyRequests"),
          loginFailed: t("errors.loginFailed"),
        }}
      />
    </main>
  );
}
