import ReviewsClient from "@/features/reviews/client/ReviewsClient";

export default async function ReviewsPage({ params }: { params: Promise<{ id: string }>}) {
  const { id } = await params;
  return <ReviewsClient propertyId={id} property={null} />;
}