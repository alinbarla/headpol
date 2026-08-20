import { ImageResponse } from "next/og";

export const alt = "Strålkastpolering — Strålkastarepolering i Stockholm";
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
            STRÅLKASTPOLERING
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
            Strålkastarepolering i Stockholm
          </div>
          <div style={{ color: "#aaaaaa", fontSize: 34, fontWeight: 500, maxWidth: 900 }}>
            Klarare ljus, säkrare körning och godkänd besiktning — utan att byta enhet.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              background: "#fff326",
              color: "#111111",
              fontSize: 28,
              fontWeight: 700,
              padding: "12px 28px",
              borderRadius: 999,
            }}
          >
            Från 799 kr
          </div>
          <div style={{ color: "#888888", fontSize: 26 }}>stralkastpolering.se</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
