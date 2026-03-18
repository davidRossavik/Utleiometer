//generert ved hjelp av Claude Sonnet 4.5
// 
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ReviewCard } from "@/features/reviews/componentes/ReviewCard";
import { Review } from "@/features/reviews/types";

describe("ReviewCard - Edit and Delete Own Review", () => {
  const mockTexts = {
    editTitle: "Rediger anmeldelse",
    defaultTitle: "Anmeldelse",
    notRated: "Ikke vurdert",
    overall: "Totalvurdering:",
    location: "Beliggenhet",
    noise: "Støy",
    landlord: "Utleier",
    condition: "Standard",
    emptyComment: "Ingen kommentar",
    confirmDelete: "Er du sikker?",
    deleteYes: "Ja, slett",
    deleteNo: "Avbryt",
    edit: "Rediger",
    delete: "Slett",
    report: "Rapporter",
    reportReasonLabel: "Hvorfor rapporterer du denne anmeldelsen?",
    reportReasonPlaceholder: "Valgfritt",
    reportSubmit: "Send rapport",
    reportCancel: "Avbryt",
    reportSubmitted: "Rapport sendt",
    reportAlreadySubmitted: "Allerede rapportert",
    reportFailed: "Kunne ikke sende",
  };

  const mockReview: Review = {
    id: "review123",
    userId: "user123",
    userDisplayName: "ola_nordmann",
    propertyId: "property456",
    ratings: {
      location: 4,
      noise: 3,
      landlord: 5,
      condition: 4,
      overall: 4,
    },
    comment: "Bra bolig!",
    title: "Anbefales",
    createdAt: { toDate: () => new Date("2024-01-15") } as any,
  };

  describe("Ownership and Visibility", () => {
    it("shows the author's username as the review heading", () => {
      render(
        <ReviewCard
          review={mockReview}
          currentUserId="user123"
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onToggleLike={vi.fn()}
          texts={mockTexts}
        />
      );

      expect(screen.getByText("ola_nordmann")).toBeInTheDocument();
      expect(screen.queryByText("Anmeldelse")).not.toBeInTheDocument();
    });

    it("falls back to default title when username is missing", () => {
      render(
        <ReviewCard
          review={{ ...mockReview, userDisplayName: undefined }}
          currentUserId="user123"
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onToggleLike={vi.fn()}
          texts={mockTexts}
        />
      );

      expect(screen.getByText("Anmeldelse")).toBeInTheDocument();
    });

    it("does not repeat the username in the metadata line", () => {
      render(
        <ReviewCard
          review={mockReview}
          currentUserId="user123"
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onToggleLike={vi.fn()}
          texts={mockTexts}
        />
      );

      expect(screen.getAllByText("ola_nordmann")).toHaveLength(1);
    });

    it("should show edit and delete buttons when user owns the review", () => {
      render(
        <ReviewCard
          review={mockReview}
          currentUserId="user123"
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onToggleLike={vi.fn()}
          texts={mockTexts}
        />
      );

      expect(screen.getByText("Rediger")).toBeInTheDocument();
      expect(screen.getByText("Slett")).toBeInTheDocument();
    });

    it("should NOT show edit and delete buttons when user does not own the review", () => {
      render(
        <ReviewCard
          review={mockReview}
          currentUserId="otherUser"
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onToggleLike={vi.fn()}
          texts={mockTexts}
        />
      );

      expect(screen.queryByText("Rediger")).not.toBeInTheDocument();
      expect(screen.queryByText("Slett")).not.toBeInTheDocument();
    });

    it("should show delete but not edit when admin is not the owner", () => {
      render(
        <ReviewCard
          review={mockReview}
          currentUserId="otherUser"
          isAdmin
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onToggleLike={vi.fn()}
          texts={mockTexts}
        />
      );

      expect(screen.queryByText("Rediger")).not.toBeInTheDocument();
      expect(screen.getByText("Slett")).toBeInTheDocument();
    });

    it("should NOT show edit and delete buttons when no user is logged in", () => {
      render(
        <ReviewCard
          review={mockReview}
          currentUserId={undefined}
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onToggleLike={vi.fn()}
          texts={mockTexts}
        />
      );

      expect(screen.queryByText("Rediger")).not.toBeInTheDocument();
      expect(screen.queryByText("Slett")).not.toBeInTheDocument();
    });
  });

  describe("Edit Functionality", () => {
    it("should enter edit mode when edit button is clicked", () => {
      render(
        <ReviewCard
          review={mockReview}
          currentUserId="user123"
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onToggleLike={vi.fn()}
          texts={mockTexts}
        />
      );

      const editButton = screen.getByText("Rediger");
      fireEvent.click(editButton);

      expect(screen.getByText("Rediger anmeldelse")).toBeInTheDocument();
      expect(screen.queryByText("Rediger")).not.toBeInTheDocument();
    });

    it("should exit edit mode when cancel is clicked", () => {
      render(
        <ReviewCard
          review={mockReview}
          currentUserId="user123"
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onToggleLike={vi.fn()}
          texts={mockTexts}
        />
      );

      // Enter edit mode
      fireEvent.click(screen.getByText("Rediger"));
      expect(screen.getByText("Rediger anmeldelse")).toBeInTheDocument();

      // Cancel edit
      const cancelButton = screen.getByText("Avbryt");
      fireEvent.click(cancelButton);

      // Should be back to normal view
      expect(screen.queryByText("Rediger anmeldelse")).not.toBeInTheDocument();
      expect(screen.getByText("Rediger")).toBeInTheDocument();
    });

    it("should call onSave when review is saved", async () => {
      const onSave = vi.fn();
      render(
        <ReviewCard
          review={mockReview}
          currentUserId="user123"
          onSave={onSave}
          onDelete={vi.fn()}
          onToggleLike={vi.fn()}
          texts={mockTexts}
        />
      );

      // Enter edit mode
      fireEvent.click(screen.getByText("Rediger"));

      // Make a change to the comment
      const commentInput = screen.getByLabelText("Kommentar");
      fireEvent.change(commentInput, { target: { value: "Oppdatert kommentar" } });

      // Save
      const saveButton = screen.getByText("Lagre");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalled();
      });
    });
  });

  describe("Delete Functionality", () => {
    it("should show confirmation dialog when delete button is clicked", () => {
      render(
        <ReviewCard
          review={mockReview}
          currentUserId="user123"
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onToggleLike={vi.fn()}
          texts={mockTexts}
        />
      );

      const deleteButton = screen.getByText("Slett");
      fireEvent.click(deleteButton);

      expect(screen.getByText("Er du sikker?")).toBeInTheDocument();
      expect(screen.getByText("Ja, slett")).toBeInTheDocument();
      expect(screen.getByText("Avbryt")).toBeInTheDocument();
    });

    it("should cancel deletion when cancel is clicked", () => {
      render(
        <ReviewCard
          review={mockReview}
          currentUserId="user123"
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onToggleLike={vi.fn()}
          texts={mockTexts}
        />
      );

      // Click delete
      fireEvent.click(screen.getByText("Slett"));
      expect(screen.getByText("Er du sikker?")).toBeInTheDocument();

      // Click cancel
      fireEvent.click(screen.getByText("Avbryt"));

      // Confirmation should be gone
      expect(screen.queryByText("Er du sikker?")).not.toBeInTheDocument();
      expect(screen.getByText("Slett")).toBeInTheDocument();
    });

    it("should call onDelete when deletion is confirmed", () => {
      const onDelete = vi.fn();
      render(
        <ReviewCard
          review={mockReview}
          currentUserId="user123"
          onSave={vi.fn()}
          onDelete={onDelete}
          onToggleLike={vi.fn()}
          texts={mockTexts}
        />
      );

      // Click delete
      fireEvent.click(screen.getByText("Slett"));

      // Confirm deletion
      fireEvent.click(screen.getByText("Ja, slett"));

      expect(onDelete).toHaveBeenCalledWith("review123");
    });
  });

  describe("Report Functionality", () => {
    it("shows report button for logged in non-owner", () => {
      render(
        <ReviewCard
          review={mockReview}
          currentUserId="other-user"
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onToggleLike={vi.fn()}
          onReport={vi.fn()}
          texts={mockTexts}
        />
      );

      expect(screen.getByText("Rapporter")).toBeInTheDocument();
    });

    it("does not show report button for review owner", () => {
      render(
        <ReviewCard
          review={mockReview}
          currentUserId="user123"
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onToggleLike={vi.fn()}
          onReport={vi.fn()}
          texts={mockTexts}
        />
      );

      expect(screen.queryByText("Rapporter")).not.toBeInTheDocument();
    });

    it("submits report reason and shows success message", async () => {
      const onReport = vi.fn().mockResolvedValue({ success: true });

      render(
        <ReviewCard
          review={mockReview}
          currentUserId="other-user"
          onSave={vi.fn()}
          onDelete={vi.fn()}
          onToggleLike={vi.fn()}
          onReport={onReport}
          texts={mockTexts}
        />
      );

      fireEvent.click(screen.getByText("Rapporter"));

      const reasonInput = screen.getByLabelText("Hvorfor rapporterer du denne anmeldelsen?");
      fireEvent.change(reasonInput, { target: { value: "Misvisende innhold" } });
      fireEvent.click(screen.getByText("Send rapport"));

      await waitFor(() => {
        expect(onReport).toHaveBeenCalledWith("review123", "Misvisende innhold");
      });

      expect(screen.getByText("Rapport sendt")).toBeInTheDocument();
    });
  });
});
