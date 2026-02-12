import { GalleryVerticalEnd } from "lucide-react"
import { RegisterForm } from "@/features/auth/client-components/registerForm"

export default function SignupPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
      <a
        href="/"
        className="font-bold text-center text-4xl text-blue-700"
      >
        Utleiometer
      </a>
        <RegisterForm />
      </div>
    </div>
  )
}