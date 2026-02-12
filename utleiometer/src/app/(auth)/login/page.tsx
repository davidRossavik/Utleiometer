import { LoginForm } from "@/features/auth/client-components/loginForm";

export default function Home() {
  return (
    <main className="bg-muted min-h-screen flex items-center justify-center p-6">
      <LoginForm />
    </main>
  );
}
