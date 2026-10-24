import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/store/site-layout";
import { catalogQueryOptions } from "@/lib/catalog-queries";
import { useStoreCart } from "@/hooks/use-store-cart";
import { calculateSubtotal, formatRupees, productEffectivePrice } from "@/lib/store.types";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Cart | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Review the items in your enquiry cart before sending them to the shop." },
      { property: "og:title", content: "Shopping Cart | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Review the items in your enquiry cart before sending them to the shop." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions()),
  component: CartPage,
});

function CartPage() {
  const { data } = useSuspenseQuery(catalogQueryOptions());
  const { cart, setQuantity, remove } = useStoreCart();

  const productById = new Map(data.products.map((product) => [product.id, product]));
  const lines = cart.flatMap((entry) => {
    const product = productById.get(entry.productId);
    return product ? [{ product, quantity: entry.quantity }] : [];
  });
  const staleCount = cart.length - lines.length;
  const subtotal = calculateSubtotal(lines.map((line) => ({ unitPrice: productEffectivePrice(line.product), quantity: line.quantity })));

  if (cart.length === 0 || lines.length === 0) {
    return (
      <SiteLayout>
        <div className="shell-width" style={{ padding: "3rem 0" }}>
          <div className="store-empty mx-auto max-w-xl">
            <ShoppingBag size={40} className="mx-auto mb-3 text-[var(--color-muted-foreground)]" aria-hidden />
            <h3>Your cart is empty</h3>
            <p>Browse the catalogue and add the items you need — then send your list to the shop as an enquiry.</p>
            <Button asChild>
              <Link to="/products">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="shell-width" style={{ padding: "2.5rem 0 3.5rem" }}>
        <div className="section-head">
          <p className="eyebrow">Enquiry cart</p>
          <h1 className="text-3xl">Your cart</h1>
          <p>Items stay in your cart on this device until you send the enquiry or remove them.</p>
        </div>

        {staleCount > 0 && (
          <div className="demo-banner mb-4" role="note">
            <span>{staleCount} item{staleCount === 1 ? "" : "s"} in your cart is no longer listed and was hidden. Nothing else changed.</span>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            {lines.map(({ product, quantity }) => {
              const unitPrice = productEffectivePrice(product);
              return (
                <div className="cart-row" key={product.id}>
                  <img src={product.image_url} alt={product.name} />
                  <div>
                    <p className="cart-row-name"><Link to="/products/$id" params={{ id: product.id }}>{product.name}</Link></p>
                    <p className="cart-row-meta">
                      SKU {product.sku} · {formatRupees(unitPrice)} per {product.unit}
                      {product.stock_quantity != null && <> · {product.stock_quantity} in stock</>}
                      {product.is_demo && " · demo price"}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="qty-controls" aria-label={`Quantity for ${product.name}`}>
                        <button type="button" onClick={() => setQuantity(product.id, quantity - 1, product.stock_quantity)} aria-label="Decrease quantity"><Minus size={14} /></button>
                        <input
                          type="number"
                          min={1}
                          max={product.stock_quantity ?? 999}
                          value={quantity}
                          onChange={(event) => setQuantity(product.id, Number(event.target.value) || 1, product.stock_quantity)}
                          aria-label="Quantity"
                        />
                        <button type="button" onClick={() => setQuantity(product.id, quantity + 1, product.stock_quantity)} aria-label="Increase quantity"><Plus size={14} /></button>
                      </div>
                      <Button variant="ghost" size="sm" className="text-[var(--color-destructive)]" onClick={() => remove(product.id)}>
                        <Trash2 size={14} /> Remove
                      </Button>
                    </div>
                  </div>
                  <p className="cart-line-total">{formatRupees(Math.round(unitPrice * quantity * 100) / 100)}</p>
                </div>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h2 className="mb-3 text-lg">Summary</h2>
            <div className="summary-line"><span>Subtotal</span><span>{formatRupees(subtotal)}</span></div>
            <div className="summary-line form-hint"><span>Taxes &amp; delivery</span><span>Not configured</span></div>
            <p className="form-hint mt-1 mb-2">No delivery charge or tax is added yet — the shop confirms any extra cost when it confirms your enquiry.</p>
            <div className="summary-line summary-total"><span>Total</span><span>{formatRupees(subtotal)}</span></div>
            <Button asChild size="lg" className="mt-4 w-full">
              <Link to="/checkout">Proceed to enquiry</Link>
            </Button>
            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link to="/products">Continue shopping</Link>
            </Button>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
