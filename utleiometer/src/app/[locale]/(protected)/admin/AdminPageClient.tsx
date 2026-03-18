"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/firebase/client";
import {
  dismissReviewReportAsAdmin,
  listUsers,
  listReportedReviews,
  removeReportedReviewAsAdmin,
  setAdminClaim,
  removeAdminClaim,
  deleteUserAsAdmin,
  type ReportedReviewRecord,
  type UserRecord,
} from "@/app/actions/admin";
import { Button } from "@/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/feedback/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/primitives/tabs";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("no-NO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminPageClient() {
  const t = useTranslations("AdminPage");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [reports, setReports] = useState<ReportedReviewRecord[]>([]);

  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reportActionLoading, setReportActionLoading] = useState<string | null>(null);

  async function getToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  }

  async function fetchUsers() {
    setUsersLoading(true);
    setUsersError(null);

    const token = await getToken();
    if (!token) {
      setUsersError(t("notLoggedIn"));
      setUsersLoading(false);
      return;
    }

    const result = await listUsers(token);
    if (result.error) {
      setUsersError(result.error);
    } else {
      setUsers(result.users ?? []);
    }

    setUsersLoading(false);
  }

  async function fetchReports() {
    setReportsLoading(true);
    setReportsError(null);

    const token = await getToken();
    if (!token) {
      setReportsError(t("notLoggedIn"));
      setReportsLoading(false);
      return;
    }

    const result = await listReportedReviews(token);
    if (result.error) {
      setReportsError(result.error);
    } else {
      setReports(result.reports ?? []);
    }

    setReportsLoading(false);
  }

  useEffect(() => {
    fetchUsers();
    fetchReports();
  }, []);

  async function handleToggleAdmin(user: UserRecord) {
    setActionLoading(user.uid);

    const token = await getToken();
    if (!token) {
      setActionLoading(null);
      return;
    }

    const result = user.isAdmin
      ? await removeAdminClaim(user.uid, token)
      : await setAdminClaim(user.uid, token);

    if (result.error) {
      alert(result.error);
    } else {
      await fetchUsers();
    }
    setActionLoading(null);
  }

  async function handleDeleteUser(user: UserRecord) {
    const confirmed = window.confirm(
      `${t("confirmDelete")} "${user.displayName ?? user.email}"?`
    );
    if (!confirmed) return;

    setActionLoading(user.uid);

    const token = await getToken();
    if (!token) {
      setActionLoading(null);
      return;
    }

    const result = await deleteUserAsAdmin(user.uid, token);
    if (result.error) {
      alert(result.error);
    } else {
      await fetchUsers();
    }
    setActionLoading(null);
  }

  async function handleDismissReport(report: ReportedReviewRecord) {
    const confirmed = window.confirm(t("confirmDismissReport"));
    if (!confirmed) return;

    const actionKey = `${report.reportId}:dismiss`;
    setReportActionLoading(actionKey);

    const token = await getToken();
    if (!token) {
      setReportActionLoading(null);
      return;
    }

    const result = await dismissReviewReportAsAdmin(report.reportId, token);
    if (result.error) {
      alert(result.error);
    } else {
      await fetchReports();
    }

    setReportActionLoading(null);
  }

  async function handleRemoveReportedReview(report: ReportedReviewRecord) {
    const confirmed = window.confirm(`${t("confirmRemoveReview")} (${report.reviewId})?`);
    if (!confirmed) return;

    const actionKey = `${report.reportId}:remove`;
    setReportActionLoading(actionKey);

    const token = await getToken();
    if (!token) {
      setReportActionLoading(null);
      return;
    }

    const result = await removeReportedReviewAsAdmin(report.reportId, token);
    if (result.error) {
      alert(result.error);
    } else {
      await fetchReports();
    }

    setReportActionLoading(null);
  }

  function statusLabel(status: ReportedReviewRecord["reportStatus"]) {
    if (status === "resolved") return t("statusResolved");
    if (status === "dismissed") return t("statusDismissed");
    return t("statusPending");
  }

  function statusClass(status: ReportedReviewRecord["reportStatus"]) {
    if (status === "resolved") return "bg-emerald-100 text-emerald-700";
    if (status === "dismissed") return "bg-zinc-200 text-zinc-700";
    return "bg-amber-100 text-amber-700";
  }

  function formatReportedProperty(report: ReportedReviewRecord) {
    const propertyName = report.propertyDisplayName?.trim();
    const propertyId = report.propertyId?.trim();

    if (propertyName && propertyId) {
      return `${propertyName} (${propertyId})`;
    }

    return propertyName || propertyId || "—";
  }

  function formatReporter(report: ReportedReviewRecord) {
    const name = report.reporterDisplayName?.trim();
    const email = report.reporterEmail?.trim();
    const uid = report.reporterUserId?.trim();

    if (name && email) {
      return `${name} (${email})`;
    }

    return name || email || uid || "—";
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm" className="mb-4 border-blue-300 text-blue-700 hover:bg-blue-50">
          <Link href="/">{t("backButton")}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-blue-700 drop-shadow-sm">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">{t("tabOverview")}</TabsTrigger>
          <TabsTrigger value="reports">{t("tabReports")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {usersLoading ? (
            <p className="text-muted-foreground">{t("loading")}</p>
          ) : usersError ? (
            <p className="text-destructive">{usersError}</p>
          ) : (
            <div className="rounded-xl border bg-background shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("colName")}</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("colEmail")}</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("colRole")}</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">{t("colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.uid} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 font-medium">{user.displayName ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.isAdmin
                              ? "bg-blue-100 text-blue-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.isAdmin ? t("roleAdmin") : t("roleUser")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            disabled={actionLoading === user.uid}
                            onClick={() => handleToggleAdmin(user)}
                          >
                            {user.isAdmin ? t("removeAdmin") : t("makeAdmin")}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={actionLoading === user.uid}
                            onClick={() => handleDeleteUser(user)}
                          >
                            {t("delete")}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports">
          <Card className="gap-4">
            <CardHeader>
              <CardTitle>{t("reportsTitle")}</CardTitle>
              <CardDescription>{t("reportsSubtitle")}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {reportsLoading ? (
                <p className="text-sm text-muted-foreground">{t("reportsLoading")}</p>
              ) : reportsError ? (
                <p className="text-sm text-destructive">{reportsError}</p>
              ) : reports.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("reportsEmpty")}</p>
              ) : (
                reports.map((report) => {
                  const isBusyForReport =
                    reportActionLoading?.startsWith(`${report.reportId}:`) ?? false;

                  return (
                    <div key={report.reportId} className="rounded-lg border bg-background/90 p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">
                          {t("reportItemTitle")} #{report.reportId}
                        </p>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(report.reportStatus)}`}
                        >
                          {statusLabel(report.reportStatus)}
                        </span>
                      </div>

                      <div className="grid gap-2 text-sm sm:grid-cols-2">
                        <p><span className="font-medium">{t("reportLinkedReview")}:</span> {report.reviewId}</p>
                        <p><span className="font-medium">{t("reportProperty")}:</span> {formatReportedProperty(report)}</p>
                        <p>
                          <span className="font-medium">{t("reporterLabel")}:</span>{" "}
                          {formatReporter(report)}
                        </p>
                        <p><span className="font-medium">{t("reportDateLabel")}:</span> {formatDate(report.reportCreatedAt)}</p>
                      </div>

                      <p className="mt-3 text-sm">
                        <span className="font-medium">{t("reportReasonLabel")}:</span>{" "}
                        {report.reportReason?.trim() ? report.reportReason : t("reportReasonEmpty")}
                      </p>

                      <div className="mt-3 rounded-md border bg-muted/30 p-3">
                        <p className="mb-2 text-sm font-medium">{t("reviewDetailsTitle")}</p>
                        {report.reviewExists ? (
                          <div className="grid gap-2 text-sm sm:grid-cols-2">
                            <p>
                              <span className="font-medium">{t("reviewAuthorLabel")}:</span>{" "}
                              {report.reviewAuthorDisplayName ||
                                report.reviewDisplayName ||
                                report.reviewAuthorEmail ||
                                report.reviewAuthorUserId ||
                                report.reviewUserId ||
                                "—"}
                            </p>
                            <p>
                              <span className="font-medium">{t("reviewRatingLabel")}:</span>{" "}
                              {typeof report.reviewOverall === "number" ? report.reviewOverall : "—"}
                            </p>
                            <p className="sm:col-span-2">
                              <span className="font-medium">{t("reviewCommentLabel")}:</span>{" "}
                              {report.reviewComment?.trim() || "—"}
                            </p>
                            <p>
                              <span className="font-medium">{t("reviewCreatedLabel")}:</span>{" "}
                              {formatDate(report.reviewCreatedAt)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">{t("reviewMissing")}</p>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isBusyForReport}
                          onClick={() => handleDismissReport(report)}
                        >
                          {t("dismissReport")}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isBusyForReport}
                          onClick={() => handleRemoveReportedReview(report)}
                        >
                          {t("removeReview")}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
