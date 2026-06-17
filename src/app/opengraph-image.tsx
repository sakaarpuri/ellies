import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#F6F1EA",
          color: "#151515",
          fontFamily: "Georgia, serif",
          padding: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            borderTop: "2px solid rgba(21,21,21,0.2)",
            borderBottom: "2px solid rgba(21,21,21,0.2)",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "48px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: "720px" }}>
            <div
              style={{
                color: "#35452F",
                fontFamily: "Arial, sans-serif",
                fontSize: "24px",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: "28px",
              }}
            >
              Ellie&apos;s Botanics
            </div>
            <div style={{ fontSize: "92px", lineHeight: 0.96 }}>
              Herbal wisdom for modern wellness.
            </div>
          </div>
          <div
            style={{
              width: "290px",
              height: "430px",
              border: "2px dashed rgba(53,69,47,0.48)",
              borderRadius: "999px",
              background: "#B9BB85",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
