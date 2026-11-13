export const genderOptions = ["Woman", "Man", "Non-binary", "Prefer not to say"] as const;

export function readConsultationDetails(body: Record<string, unknown>) {
  const concern = typeof body.concern === "string" ? body.concern.trim() : "";
  const age = body.age ?? "";
  const gender = body.gender ?? "";

  if (
    concern.length < 2 ||
    concern.length > 900 ||
    typeof age !== "string" ||
    (age !== "" && (!/^[1-9]\d{0,2}$/.test(age) || Number(age) > 120)) ||
    typeof gender !== "string" ||
    (gender !== "" && !genderOptions.some((option) => option === gender))
  ) {
    return null;
  }

  return { concern, age, gender };
}
