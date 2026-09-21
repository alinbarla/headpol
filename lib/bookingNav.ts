import { getProduct, type ProductId } from "@/lib/products";

/** Dispatched when a same-page CTA selects a booking service without navigation. */
export const BOOKING_SET_SERVICE_EVENT = "booking:set-service";

/**
 * If the booking section is already on the page, update `?service=` + `#booking`,
 * notify listeners, and scroll — without a full reload.
 * Returns true when handled in-place (caller should preventDefault).
 */
export function selectBookingService(productId: ProductId): boolean {
  const booking = document.getElementById("booking");
  if (!booking) return false;

  const id = getProduct(productId).id;
  const url = new URL(window.location.href);
  url.searchParams.set("service", id);
  const query = url.searchParams.toString();
  window.history.pushState(
    null,
    "",
    `${url.pathname}${query ? `?${query}` : ""}#booking`
  );
  window.dispatchEvent(
    new CustomEvent<ProductId>(BOOKING_SET_SERVICE_EVENT, { detail: id })
  );
  booking.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}
