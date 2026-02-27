import { AuthButtons } from "@/features/auth/client-components/authButtons";
import { WelcomeMessage } from "@/features/auth/client-components/welcomeMessage";
import ReviewsClient from "@/features/reviews/client/ReviewsClient";

export default async function ReviewsPage({ params }: { params: Promise<{ id: string }>}) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="border-b">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-muted" />
              <span className="font-semibold">Utleiometer</span>
              <WelcomeMessage />
          </div>
          <AuthButtons />
          </div>
      </header>
      
      <ReviewsClient propertyId={id} property={null} />

      {/* FOOTER */}
      <footer className="border-t">
          <div className="container mx-auto px-4 py-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Utleiometer. Laget av Lillian, Katharina, Robert, David og Marius / PU-gruppe 4.
          </div>
      </footer>
    </div>
    );
}