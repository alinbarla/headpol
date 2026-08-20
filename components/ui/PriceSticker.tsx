type PriceStickerProps = {
  oldPrice: string;
  price: string;
  unit: string;
};

export function PriceSticker({ oldPrice, price, unit }: PriceStickerProps) {
  return (
    <p className="price-sticker" aria-label={`${oldPrice} ${unit}, ${price} ${unit}`}>
      <span className="price-sticker-old">
        <s>{oldPrice}</s>
        <span>/{unit}</span>
      </span>
      <span className="price-sticker-now">
        {price}
        <span>/{unit}</span>
      </span>
    </p>
  );
}
