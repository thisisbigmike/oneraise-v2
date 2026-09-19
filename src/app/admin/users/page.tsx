import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { UserLookup } from "@/components/admin/user-lookup";
import { requireViewer } from "@/server/auth";
import { getUserProfile, searchUsers } from "@/server/queries/admin";

export const metadata: Metadata = { title: "Users | OneRaise Admin" };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; user?: string }> }) {
  const viewer = await requireViewer("/admin/users", ["admin"]);
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const results = await searchUsers(query);
  const chosen = Number(params.user) || (query ? results[0]?.id : undefined);
  const profile = chosen ? await getUserProfile(chosen) : null;
  return (
    <AdminShell active="users" title="Users" viewer={viewer}>
      <UserLookup query={query} results={results} profile={profile} viewerId={viewer.id} />
    </AdminShell>
  );
}
