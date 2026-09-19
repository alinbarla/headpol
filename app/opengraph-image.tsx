import { ImageResponse } from "next/og";

export const alt =
  "Strålkastarpolering — polering, PPF-folie och paket i Stockholm";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(1100px 500px at 80% -10%, rgba(255,243,38,0.22), transparent 60%), #111111",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 999,
              background: "#fff326",
              color: "#111111",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            S
          </div>
          <div style={{ color: "#fff326", fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>
            STRÅLKASTARPOLERING
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              color: "#ffffff",
              fontSize: 78,
              fontWeight: 800,
              lineHeight: 1.05,
              maxWidth: 980,
            }}
          >
            Kristallklara strålkastare igen
          </div>
          <div style={{ color: "#aaaaaa", fontSize: 30, fontWeight: 500, maxWidth: 920 }}>
            Polering 899 kr · PPF 1899 kr · Paket 2599 kr. 12 mån garanti. Vi kommer till dig.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {["899kr", "1899kr", "2599kr"].map((price) => (
            <div
              key={price}
              style={{
                display: "flex",
                background: "#fff326",
                color: "#111111",
                fontSize: 24,
                fontWeight: 700,
                padding: "10px 20px",
                borderRadius: 999,
              }}
            >
              {price}
            </div>
          ))}
          <div style={{ color: "#888888", fontSize: 24, marginLeft: 8 }}>
            stralkastarpolering.se
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
