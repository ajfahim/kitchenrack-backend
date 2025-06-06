// Utility to compute display_price and display_sale_price for a product (with or without variants)
// Types are inferred from your service usage; adjust as needed for your actual types

type Variant = {
  price: number;
  sale_price?: number | null;
};

type ProductWithVariants = {
  price: number;
  sale_price?: number | null;
  has_variants: boolean;
  variants?: Variant[];
};

export function computeDisplayPrices(product: ProductWithVariants): {
  display_price: number;
  display_sale_price: number | null;
} {
  let display_price: number;
  let display_sale_price: number | null = null;
  if (product.has_variants && product.variants && product.variants.length > 0) {
    // Min regular price
    const regularPrices = product.variants.map(v => v.price);
    display_price = Math.min(...regularPrices);
    // Min sale price if any
    const salePrices = product.variants
      .map(v => v.sale_price)
      .filter((sp: number | null | undefined) => sp !== null && sp !== undefined) as number[];
    display_sale_price = salePrices.length > 0 ? Math.min(...salePrices) : null;
  } else {
    display_price = product.price;
    display_sale_price = product.sale_price ?? null;
  }
  return { display_price, display_sale_price };
}
