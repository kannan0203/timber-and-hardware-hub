import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowUpRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/store/site-layout";
import { productQueryOptions } from "@/lib/catalog-queries";
import { buildWhatsAppUrl, formatRupees, productEffectivePrice } from "@/lib/store.types";
import { useStoreCart } from "@/hooks/use-store-cart";

export const Route = createFileRoute("/products/$id")({
  head: () => ({
    meta: [
      {
        title: "Product | Sri Amman & Senthivelan Hardwares",
        "data-testid": "product-title",
      },
      { name: "description", content: "Product listing from Sri Amman & Senthivelan Hardwares." },
      { property: "og:title", content: "Product | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Product listing from Sri Amman & Senthivelan Hardwares." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productQueryOptions(params.id)),
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(productQueryOptions(id));
  if (!data) throw notFound();
  const product = data;
  const { add } = useStoreCart();

  useEffect(() => {
    document.title = `${product.name} | Sri Amman & Senthivelan Hardwares`;
  }, [product.name]);

  const [quantity, setQuantity] = useState(1);
  const hasDiscount = product.discount_price != null && product.discount_price < product.price;
  const effective = productEffectivePrice(product);
  const stockLimit = product.stock_quantity;

  const specs: Array<[string, string]> = [
    ["Product ID (SKU)", product.sku],
    ["Category", product.category_name],
    ["Sold as", product.unit],
    ["Size", product.size ?? "—"],
    ["Material", product.material ?? "—"],
    ["Colour", product.color ?? "—"],
    ["Brand", product.brand ?? "—"],
    ["Availability", product.is_available ? "Available (online listing)" : "Currently not listed as available"],
    ...(stockLimit != null ? ([["Stock on hand", String(stockLimit)]] as Array<[string, string]>) : []),
  ];

  const enquiryMessage = [
    "Hello, I would like to enquire about this product:",
    "",
    `${product.name} (SKU: ${product.sku})`,
    `Listed price: ${formatRupees(effective)} per ${product.unit}`,
    "",
    "Please confirm availability and the current price.",
  ].join("\n");

  const changeQuantity = (next: number) => {
    const clamped = Math.max(1, stockLimit != null ? Math.min(next, stockLimit) : Math.min(next, 999));
    setQuantity(clamped);
  };

  return (
    <SiteLayout>
      <div className="shell-width" style={{ padding: "2rem 0 3.5rem" }}>
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-[var(--color-muted-foreground)]">
          <Link to="/products" className="underline underline-offset-3">All products</Link>
          <span aria-hidden> / </span>
          <span>{product.name}</span>
        </nav>

        <div className="detail-grid">
          <div className="detail-media">
            <img src={product.image_url} alt={product.name} />
          </div>
          <div>
            <p className="product-card-category mb-1">{product.category_name}</p>
            <h1 className="text-3xl">{product.name}</h1>
            <div className="price-row mt-3">
              <span className="price-current text-2xl">{formatRupees(effective)}</span>
              {hasDiscount && <span className="price-original">{formatRupees(product.price)}</span>}
              <span className="price-unit">per {product.unit}</span>
            </div>

            {product.is_demo && (
              <div className="demo-banner mt-4" role="note">
                <span aria-hidden>ℹ</span>
                <span>
                  Sample listing with a <strong>demo price</strong>. Confirm the specification and the real price with the
                  shop before ordering.
                </span>
              </div>
            )}

            <p className="mt-4 leading-relaxed text-[var(--color-muted-foreground)]">{product.description}</p>

            {(((product.variants ?? []) as Array<{ name: string; options: string[] }>).length > 0 && (
              <div className="mt-4">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">Options</h2>
                <div className="variant-list">
                  {((product.variants ?? []) as Array<{ name: string; options: string[] }>).flatMap((variant, index) =>
                    variant.options.map((option) => (
                      <span key={`${variant.name}-${index}-${option}`} className="variant-chip">{variant.name}: {option}</span>
                    )),
                  )}
                </div>
              </div>
            ))}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="qty-controls" aria-label="Quantity">
                <button type="button" onClick={() => changeQuantity(quantity - 1)} aria-label="Decrease quantity"><Minus size={15} /></button>
                <input
                  type="number"
                  min={1}
                  max={stockLimit ?? 999}
                  value={quantity}
                  onChange={(event) => changeQuantity(Number(event.target.value) || 1)}
                  aria-label="Quantity"
                />
                <button type="button" onClick={() => changeQuantity(quantity + 1)} aria-label="Increase quantity"><Plus size={15} /></button>
              </div>
              <Button size="lg" onClick={() => add(product.id, quantity, stockLimit)}>
                <ShoppingBag size={17} /> Add to cart
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href={buildWhatsAppUrl(enquiryMessage)} target="_blank" rel="noreferrer">
                  Enquire on WhatsApp <ArrowUpRight size={15} />
                </a>
              </Button>
            </div>

            <table className="spec-table mt-8">
              <caption className="sr-only">Product specification</caption>
              <tbody>
                {specs.map(([label, value]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
