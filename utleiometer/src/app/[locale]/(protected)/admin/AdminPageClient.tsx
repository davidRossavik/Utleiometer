"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/firebase/client";
import {
  listUsers,
  setAdminClaim,
  removeAdminClaim,
  deleteUserAsAdmin,
  type UserRecord,
} from "@/app/actions/admin";
import { Button } from "@/ui/primitives/button";

export default function AdminPageClient() {
  const t = useTranslations("AdminPage");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function getToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  }

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    const token = await getToken();
    if (!token) {
      setError(t("notLoggedIn"));
      setLoading(false);
      return;
    }
    const result = await listUsers(token);
    if (result.error) {
      setError(result.error);
    } else {
      setUsers(result.users ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleToggleAdmin(user: UserRecord) {
    setActionLoading(user.uid);
    const token = await getToken();
    if (!token) return;

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
    if (!token) return;

    const result = await deleteUserAsAdmin(user.uid, token);
    if (result.error) {
      alert(result.error);
    } else {
      await fetchUsers();
    }
    setActionLoading(null);
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

      {loading && (
        <p className="text-muted-foreground">{t("loading")}</p>
      )}
      {error && (
        <p className="text-destructive">{error}</p>
      )}

      {!loading && !error && (
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
    </div>
  );
}
