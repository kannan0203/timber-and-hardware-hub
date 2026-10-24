import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/store/site-layout";
import { ProductCard } from "@/components/store/product-card";
import { catalogQueryOptions, searchProducts, sortCatalogProducts, type ProductSort } from "@/lib/catalog-queries";

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): { q: string } => ({
    q: typeof search.q === "string" ? search.q.slice(0, 80) : "",
  }),
  head: () => ({
    meta: [
      { title: "All Products | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Browse the full catalogue: timber, plywood, doors, paints, tools and everyday hardware." },
      { property: "og:title", content: "All Products | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Browse the full catalogue: timber, plywood, doors, paints, tools and everyday hardware." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions()),
  component: ProductsPage,
});

const SORT_LABELS: Record<ProductSort, string> = {
  "name-asc": "Name A–Z",
  "name-desc": "Name Z–A",
  "price-asc": "Price low to high",
  "price-desc": "Price high to low",
};

function ProductsPage() {
  const { data } = useSuspenseQuery(catalogQueryOptions());
  const search = Route.useSearch();
  const [query, setQuery] = useState(search.q);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [sort, setSort] = useState<ProductSort>("name-asc");

  useEffect(() => {
    setQuery(search.q);
  }, [search.q]);

  const products = useMemo(() => {
    const inCategory = activeSlug ? data.products.filter((product) => product.category_slug === activeSlug) : data.products;
    return sortCatalogProducts(searchProducts(inCategory, query), sort);
  }, [data.products, activeSlug, query, sort]);

  return (
    <SiteLayout>
      <div className="shell-width" style={{ padding: "2.5rem 0 3.5rem" }}>
        <div className="section-head">
          <p className="eyebrow">Catalogue</p>
          <h1 className="text-3xl">All products</h1>
          <p>Everything listed so far. Prices marked “Demo” are illustrative samples until the shop confirms real prices.</p>
        </div>

        <div className="filter-toolbar">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" aria-hidden />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="pl-9"
            />
          </div>
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

        <div className="chip-row" role="group" aria-label="Filter by category">
          <button type="button" className={`chip ${activeSlug === null ? "is-active" : ""}`} onClick={() => setActiveSlug(null)}>All</button>
          {data.categories.map((category) => (
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

        <p className="result-count mb-4">{products.length} product{products.length === 1 ? "" : "s"} found</p>

        {products.length === 0 ? (
          <div className="store-empty">
            <h3>No products match your search</h3>
            <p>Try a different word, or clear the category filter. You can also call or WhatsApp the shop — the online catalogue only shows part of our stock.</p>
            <Button asChild variant="secondary" size="sm">
              <Link to="/products">Clear search</Link>
            </Button>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
