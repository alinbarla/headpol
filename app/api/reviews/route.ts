import { NextResponse } from "next/server";
import { getPlaceReviews, isPlacesConfigured } from "@/lib/places/reviews";

export const revalidate = 43200;

export async function GET() {
  if (!isPlacesConfigured()) {
    return NextResponse.json(
      { error: "Missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID env vars" },
      { status: 500 }
    );
  }

  const data = await getPlaceReviews();
  return NextResponse.json(data);
}
