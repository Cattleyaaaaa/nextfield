import "server-only";

const adminGithubIds = new Set(
  ["182344046", ...(process.env.GUESTBOOK_ADMIN_GITHUB_IDS || "").split(",")]
    .map((id) => id.trim())
    .filter(Boolean),
);

export const guestbookIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isGuestbookAdmin(user: {
  identities?: {
    provider?: string;
    provider_id?: string;
    identity_data?: { id?: string | number; sub?: string | number };
  }[];
}) {
  return user.identities?.some((identity) => {
    if (identity.provider !== "github") return false;
    const providerIds = [identity.provider_id, identity.identity_data?.sub, identity.identity_data?.id]
      .map((id) => String(id ?? "").trim())
      .filter(Boolean);
    return providerIds.some((id) => adminGithubIds.has(id));
  }) === true;
}
