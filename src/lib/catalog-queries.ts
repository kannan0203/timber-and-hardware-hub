import { queryOptions } from "@tanstack/react-query";
import { getCatalog, getProduct } from "./store.functions";
import type { CatalogProduct } from "./store.types";

export type CatalogData = Awaited<ReturnType<typeof getCatalog>>;
export type ProductSort = "name-asc" | "name-desc" | "price-asc" | "price-desc";

export const catalogQueryOptions = () =>
  queryOptions({
    queryKey: ["store-catalog"],
    queryFn: () => getCatalog({ data: {} }),
  });

export const productQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["store-product", id],
    queryFn: () => getProduct({ data: { id } }),
  });

export function sortCatalogProducts(products: CatalogProduct[], sort: ProductSort): CatalogProduct[] {
  const sorted = [...products];
  const effective = (product: CatalogProduct) => product.discount_price ?? product.price;
  switch (sort) {
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "price-asc":
      return sorted.sort((a, b) => effective(a) - effective(b));
    case "price-desc":
      return sorted.sort((a, b) => effective(b) - effective(a));
  }
}

export function productsInCategories(products: CatalogProduct[], slugs: string[]): CatalogProduct[] {
  const allowed = new Set(slugs);
  return products.filter((product) => allowed.has(product.category_slug));
}

export function searchProducts(products: CatalogProduct[], query: string): CatalogProduct[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return products;
  return products.filter((product) => {
    const haystack = [product.name, product.sku, product.category_name, product.description ?? "", product.brand ?? "", product.material ?? ""]
      .join(" ")
      .toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
