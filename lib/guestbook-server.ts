import "server-only";

const adminGithubIds = new Set(
  (process.env.GUESTBOOK_ADMIN_GITHUB_IDS || "182344046")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),
);

export const guestbookIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isGuestbookAdmin(user: {
  identities?: { provider?: string; provider_id?: string }[];
}) {
  return user.identities?.some((identity) =>
    identity.provider === "github" &&
    adminGithubIds.has(String(identity.provider_id || "")),
  ) === true;
}
