import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { catalogQueryOptions, productsInCategories, sortCatalogProducts, type ProductSort } from "@/lib/catalog-queries";
import { ProductCard } from "./product-card";

const SORT_LABELS: Record<ProductSort, string> = {
  "name-asc": "Name A–Z",
  "name-desc": "Name Z–A",
  "price-asc": "Price low to high",
  "price-desc": "Price high to low",
};

export function CategoryListing({ eyebrow, title, description, slugs }: {
  eyebrow: string;
  title: string;
  description: string;
  slugs: string[];
}) {
  const { data } = useSuspenseQuery(catalogQueryOptions());
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [sort, setSort] = useState<ProductSort>("name-asc");
  const slugKey = slugs.join(",");

  const categories = useMemo(
    () => data.categories.filter((category) => slugs.includes(category.slug)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.categories, slugKey],
  );
  const products = useMemo(
    () => sortCatalogProducts(productsInCategories(data.products, slugs).filter((product) => !activeSlug || product.category_slug === activeSlug), sort),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.products, slugKey, activeSlug, sort],
  );

  return (
    <div className="shell-width" style={{ padding: "2.5rem 0 3.5rem" }}>
      <div className="section-head">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="text-3xl">{title}</h1>
        <p>{description}</p>
      </div>
      <div className="chip-row" role="group" aria-label="Filter by sub-category">
        <button type="button" className={`chip ${activeSlug === null ? "is-active" : ""}`} onClick={() => setActiveSlug(null)}>
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            className={`chip ${activeSlug === category.slug ? "is-active" : ""}`}
            onClick={() => setActiveSlug(category.slug)}
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className="filter-toolbar">
        <p className="result-count">{products.length} product{products.length === 1 ? "" : "s"} · prices marked “Demo” are illustrative</p>
        <Select value={sort} onValueChange={(value) => setSort(value as ProductSort)}>
          <SelectTrigger className="w-[210px]" aria-label="Sort products">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABELS) as ProductSort[]).map((key) => (
              <SelectItem key={key} value={key}>{SORT_LABELS[key]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {products.length === 0 ? (
        <div className="store-empty">
          <h3>Nothing listed here yet</h3>
          <p>We are still adding this range to the online catalogue. Call or WhatsApp the shop and we will help directly.</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}
