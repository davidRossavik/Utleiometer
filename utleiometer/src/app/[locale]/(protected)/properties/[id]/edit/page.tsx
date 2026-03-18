import { redirect } from "next/navigation";

export const metadata = {
  title: "Rediger eiendom | Utleiometer",
};

export default async function Page({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = await params;
  redirect(`/properties/${id}/reviews`);
}
