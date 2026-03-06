import { RegisterForm } from "@/features/auth/client-components/registerForm"
import { getTranslations } from "next-intl/server"

export default async function SignupPage() {
  const t = await getTranslations("RegisterPage");

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
      <a
        href="/"
        className="font-bold text-center text-4xl text-blue-700"
      >
        {t("brand")}
      </a>
        <RegisterForm
          texts={{
            title: t("title"),
            description: t("description"),
            usernameLabel: t("usernameLabel"),
            usernamePlaceholder: t("usernamePlaceholder"),
            emailLabel: t("emailLabel"),
            emailPlaceholder: t("emailPlaceholder"),
            passwordLabel: t("passwordLabel"),
            confirmPasswordLabel: t("confirmPasswordLabel"),
            passwordHint: t("passwordHint"),
            submit: t("submit"),
            hasAccount: t("hasAccount"),
            loginLink: t("loginLink"),
            termsPrefix: t("termsPrefix"),
            termsLink: t("termsLink"),
            andText: t("andText"),
            privacyLink: t("privacyLink"),
          }}
          messages={{
            usernameRequired: t("errors.usernameRequired"),
            usernameInvalid: t("errors.usernameInvalid"),
            emailRequired: t("errors.emailRequired"),
            emailInvalid: t("errors.emailInvalid"),
            passwordRequired: t("errors.passwordRequired"),
            passwordInvalid: t("errors.passwordInvalid"),
            confirmPasswordMismatch: t("errors.confirmPasswordMismatch"),
            emailInUse: t("errors.emailInUse"),
            invalidEmailFirebase: t("errors.invalidEmailFirebase"),
            weakPassword: t("errors.weakPassword"),
            registerFailed: t("errors.registerFailed"),
          }}
        />
      </div>
    </div>
  )
}