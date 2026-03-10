import { getTranslations } from "next-intl/server";
import ReviewCreateClient from "@/features/reviews/client/ReviewCreateClient";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ address?: string }>;
};

export default async function ReviewRegisterPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { address } = await searchParams;
  const t = await getTranslations("PropertyReviewNewPage");

  return (
    <ReviewCreateClient
      propertyId={id}
      address={address ?? ""}
      texts={{
        brand: t("brand"),
        cardTitlePrefix: t("form.cardTitlePrefix"),
        cardDescription: t("form.cardDescription"),
        commentLabel: t("form.commentLabel"),
        commentPlaceholder: t("form.commentPlaceholder"),
        ratingsTitle: t("form.ratingsTitle"),
        locationLabel: t("form.locationLabel"),
        locationHelp: t("form.locationHelp"),
        noiseLabel: t("form.noiseLabel"),
        noiseHelp: t("form.noiseHelp"),
        landlordLabel: t("form.landlordLabel"),
        landlordHelp: t("form.landlordHelp"),
        conditionLabel: t("form.conditionLabel"),
        conditionHelp: t("form.conditionHelp"),
        cancel: t("form.cancel"),
        submit: t("form.submit"),
        submitting: t("form.submitting"),
        hint: t("form.hint"),
      }}
      messages={{
        notLoggedIn: t("messages.notLoggedIn"),
        missingPropertyId: t("messages.missingPropertyId"),
        unknownError: t("messages.unknownError"),
      }}
    />
  );
}
