import { processPayment } from "@/lib/orders";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const data = await request.formData();
    await processPayment(
      Object.fromEntries(
        Array.from(data.entries()).map(([key, value]) => [key, String(value)]),
      ),
    );
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
