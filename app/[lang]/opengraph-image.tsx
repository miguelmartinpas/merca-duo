import { ImageResponse } from "next/og";
import { dictionaries } from "@/app/i18n/dictionaries";
import { appName } from "@/app/lib/site";

export const alt = dictionaries.en["seo.title"];
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          background: "#0a1226",
          color: "#e8ecf7",
        }}
      >
        <div style={{ fontSize: 120, fontWeight: 700 }}>{appName}</div>
        <div style={{ fontSize: 44, marginTop: 24, color: "#ffb000" }}>
          Find the nearest toilet, fast
        </div>
      </div>
    ),
    size,
  );
}
