export const genderOptions = ["Male", "Female"] as const;

export function readConsultationDetails(body: Record<string, unknown>) {
  const concern = typeof body.concern === "string" ? body.concern.trim() : "";
  const age = body.age ?? "";
  const gender = body.gender ?? "";

  if (
    concern.length < 2 ||
    concern.length > 900 ||
    typeof age !== "string" ||
    (!/^[1-9]\d{0,2}$/.test(age) || Number(age) > 120) ||
    typeof gender !== "string" ||
    !genderOptions.some((option) => option === gender)
  ) {
    return null;
  }

  return { concern, age, gender };
}
