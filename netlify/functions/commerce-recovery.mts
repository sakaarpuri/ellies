export default async function commerceRecovery() {
  const secret = process.env.LEADS_WEBHOOK_SECRET;
  if (!secret) throw new Error("Notification recovery is missing its secret");
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.elliesbotanics.com";
  const response = await fetch(
    `${origin.replace(/\/$/, "")}/api/internal/commerce-recovery`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(25000),
    },
  );
  if (!response.ok)
    throw new Error(`Commerce recovery failed: ${response.status}`);
}
export const config = { schedule: "*/10 * * * *" };
