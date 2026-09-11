"use client";

import dynamic from "next/dynamic";

const BookingPicker = dynamic(
  () =>
    import("@/components/booking/BookingPicker").then((m) => ({
      default: m.BookingPicker,
    })),
  {
    ssr: false,
    loading: () => (
      <section
        id="booking"
        className="section-anchor py-24 sm:py-32"
        aria-busy="true"
        aria-label="Booking"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="min-h-[28rem] animate-pulse rounded-3xl border border-white/10 bg-white/5" />
        </div>
      </section>
    ),
  }
);

export function BookingPickerDynamic() {
  return <BookingPicker />;
}
