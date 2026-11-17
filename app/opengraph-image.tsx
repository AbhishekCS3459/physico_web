import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Physio Rehab at Home — Mobile Physiotherapy in Calgary"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

/** Default Open Graph image for social and Google link previews. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 45%, #d1fae5 100%)",
          color: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 28,
            fontWeight: 700,
            color: "#047857",
          }}
        >
          Physio Rehab at Home
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: 920 }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1 }}>
            Mobile Physiotherapy in Calgary
          </div>
          <div style={{ fontSize: 30, color: "#334155", lineHeight: 1.35 }}>
            Licensed in-home physio, occupational therapy & massage. Direct billing available.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#047857" }}>
          <span>Calgary · Airdrie · Cochrane · Chestermere</span>
          <span>(587) 586-5566</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
