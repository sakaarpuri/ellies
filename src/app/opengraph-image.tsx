import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public", site.logo));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
          background: "#283C31",
          color: "#F6F1EA",
        }}
      >
        <img
          src={`data:image/jpeg;base64,${logo.toString("base64")}`}
          alt={site.name}
          width={410}
          height={410}
          style={{ borderRadius: "50%", objectFit: "cover" }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontSize: 46,
            lineHeight: 1.1,
          }}
        >
          <span>Herbal wisdom for</span>
          <span>modern wellness.</span>
        </div>
      </div>
    ),
    size,
  );
}
