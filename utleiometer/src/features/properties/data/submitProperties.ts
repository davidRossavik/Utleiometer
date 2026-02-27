
import { createPropertyAction } from "@/app/actions/properties";
import { createReviewAction } from "@/app/actions/reviews";

export async function submitPropertiesAndReviews(args: {
    form: HTMLFormElement,
    currentUserUid: string,
    onSubmitting: (isSubmitting: boolean) => void,
    onError: (error: string) => void,
    onSuccessNavigate: (path: string) => void
}) {

    const { form, currentUserUid, onSubmitting, onError, onSuccessNavigate } = args;

    onSubmitting(true);
    onError("");

    const formData = new FormData(form); // henter ut feltene fra form

    try {
        formData.append("registeredByUid", currentUserUid);
        const propertyResult = await createPropertyAction(formData);

        if ("error" in propertyResult) { // Sjekke for feil fra server
            onError(propertyResult.error);
            return;
        }

        formData.append("propertyId", propertyResult.propertyId); //legger til propertyId og userId for å kunne opprette anmeldelse
        formData.append("userId", currentUserUid);

        await createReviewAction(formData);
        onSuccessNavigate("/");
    } catch {
        onError("Noe gikk galt");
    } finally {
        onSubmitting(false);
    }
}