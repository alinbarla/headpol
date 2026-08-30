import { ImageResponse } from "next/og";

export const size = { width: 96, height: 96 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111111",
        }}
      >
        <svg
          width="96"
          height="96"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="64" height="64" rx="14" fill="#111111" />
          <path
            d="M20 22c0-3 2-5 6-5h6c8 0 14 6 14 15s-6 15-14 15h-6c-4 0-6-2-6-5z"
            fill="#fff326"
          />
          <path
            d="M20 27h-7M20 32h-10M20 37h-7"
            stroke="#fff326"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="33" cy="32" r="6" fill="#111111" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
