import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type ProductRow = Tables<"store_products">;
export type CategoryRow = Tables<"store_categories">;
export type ProductInput = Omit<TablesInsert<"store_products">, "id" | "created_at" | "updated_at">;
export type CategoryInput = Omit<TablesInsert<"store_categories">, "id" | "created_at">;
export type ProductPatch = TablesUpdate<"store_products">;
export type EnquiryRow = Tables<"store_enquiries">;

export type CatalogProduct = ProductRow & {
  category_name: string;
  category_slug: string;
  division: string;
};

export const businessPhone = "916385743172";
export const shopAddress =
  "Thiruvapadi, Kattumavadi Road, Aranthangi Taluk, Pudukkottai District, Tamil Nadu, India – 614630";

export function productEffectivePrice(product: Pick<ProductRow, "price" | "discount_price">) {
  return product.discount_price ?? product.price;
}

export function calculateSubtotal(items: Array<{ unitPrice: number; quantity: number }>) {
  return Math.round(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) * 100) / 100;
}

export function normalizePhone(value: string) {
  return value.replace(/[\s().-]/g, "");
}

export function isValidMobile(value: string) {
  return /^\+?[0-9]{10,15}$/.test(normalizePhone(value));
}

export function formatRupees(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;
}