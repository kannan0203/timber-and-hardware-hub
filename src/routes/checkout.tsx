import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SiteLayout } from "@/components/store/site-layout";
import { catalogQueryOptions } from "@/lib/catalog-queries";
import { useStoreCart } from "@/hooks/use-store-cart";
import { submitStoreEnquiry } from "@/lib/store.functions";
import {
  buildWhatsAppUrl,
  calculateSubtotal,
  formatRupees,
  isValidMobile,
  normalizePhone,
  productEffectivePrice,
  type EnquiryRow,
} from "@/lib/store.types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout & WhatsApp Enquiry | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Send your cart to the shop as a WhatsApp enquiry. No payment is taken online." },
      { property: "og:title", content: "Checkout | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Send your cart to the shop as a WhatsApp enquiry. No payment is taken online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions()),
  component: CheckoutPage,
});

type EnquiryResult = {
  reference_code: string;
  subtotal: number;
  items: Array<{ id: string; name: string; sku: string; unit: string; quantity: number; unit_price: number; line_total: number }>;
};

type FieldErrors = Partial<Record<"customerName" | "phone" | "deliveryAddress", string>>;

function CheckoutPage() {
  const { data } = useSuspenseQuery(catalogQueryOptions());
  const { cart, clear } = useStoreCart();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<"delivery" | "collection">("collection");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<EnquiryResult | null>(null);

  const productById = new Map(data.products.map((product) => [product.id, product]));
  const lines = cart.flatMap((entry) => {
    const product = productById.get(entry.productId);
    return product ? [{ product, quantity: entry.quantity }] : [];
  });
  const subtotal = calculateSubtotal(lines.map((line) => ({ unitPrice: productEffectivePrice(line.product), quantity: line.quantity })));

  if (result) {
    const message = [
      `New material enquiry ${result.reference_code}`,
      `Name: ${customerName.trim()}`,
      `Phone: ${normalizePhone(phone)}`,
      `Fulfilment: ${fulfillment === "delivery" ? "Delivery" : "Collection at shop"}`,
      ...(fulfillment === "delivery" && deliveryAddress.trim() ? [`Address: ${deliveryAddress.trim()}`] : []),
      ...(notes.trim() ? [`Notes: ${notes.trim()}`] : []),
      "",
      "Items:",
      ...result.items.map((item, index) =>
        `${index + 1}. ${item.name} (${item.sku}) — ${item.quantity} ${item.unit} @ ${formatRupees(item.unit_price)} = ${formatRupees(item.line_total)}`,
      ),
      "",
      `Subtotal: ${formatRupees(result.subtotal)}`,
      "",
      "Please confirm availability and the final price. This is an enquiry, not a confirmed order.",
    ].join("\n");

    return (
      <SiteLayout>
        <div className="shell-width" style={{ padding: "3rem 0" }}>
          <div className="store-empty mx-auto max-w-xl text-left" style={{ padding: "2.5rem" }}>
            <CheckCircle2 size={40} className="mb-3 text-[var(--color-ring)]" aria-hidden />
            <h3>Enquiry {result.reference_code} prepared</h3>
            <p>
              A summary of your list is shown. Tap the button below to open WhatsApp with the message already written — check it and press send.
            </p>
            <div className="my-4 rounded-xl border bg-[var(--color-muted)] p-4 text-sm whitespace-pre-line">{message}</div>
            <Button asChild size="lg" className="w-full">
              <a href={buildWhatsAppUrl(message)} target="_blank" rel="noreferrer">Open WhatsApp with my enquiry</a>
            </Button>
            <p className="form-hint mt-3">
              Your enquiry is <strong>not confirmed</strong> until the shop contacts you and confirms stock and price. The cart has been cleared.
            </p>
            <Button asChild variant="secondary" className="mt-4">
              <Link to="/products">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (cart.length === 0 || lines.length === 0) {
    return (
      <SiteLayout>
        <div className="shell-width" style={{ padding: "3rem 0" }}>
          <div className="store-empty mx-auto max-w-xl">
            <h3>Nothing to enquire about yet</h3>
            <p>Add items to your cart first — then send them to the shop here.</p>
            <Button asChild><Link to="/products">Browse products</Link></Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (customerName.trim().length < 2) next.customerName = "Please enter your full name (at least 2 characters).";
    if (!isValidMobile(phone)) next.phone = "Enter a valid mobile number, e.g. 6385743172 or +916385743172.";
    if (fulfillment === "delivery" && deliveryAddress.trim().length < 5) {
      next.deliveryAddress = "Enter the delivery address, or choose collection at the shop.";
    }
    return next;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(null);
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const enquiry = await submitStoreEnquiry({
        data: {
          idempotencyKey: crypto.randomUUID(),
          customerName: customerName.trim(),
          phone: normalizePhone(phone),
          fulfillment,
          deliveryAddress: fulfillment === "delivery" ? deliveryAddress.trim() : undefined,
          notes: notes.trim() ? notes.trim() : undefined,
          items: lines.map((line) => ({ id: line.product.id, quantity: line.quantity })),
        },
      }) as unknown as EnquiryResult;
      if (typeof window !== "undefined") {
        window.open(buildWhatsAppUrl(enquiry.reference_code ? "" : ""), "_blank", "noopener");
      }
      clear();
      setResult(enquiry);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  void navigate;

  return (
    <SiteLayout>
      <div className="shell-width" style={{ padding: "2.5rem 0 3.5rem" }}>
        <div className="section-head">
          <p className="eyebrow">Enquiry checkout</p>
          <h1 className="text-3xl">Send your list to the shop</h1>
          <p>
            We prepare your enquiry, save it with a reference number, and open WhatsApp with the details filled in for
            you to review and send. No payment is taken online.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <form className="form-panel" onSubmit={onSubmit} noValidate>
            <div className="form-grid">
              <div>
                <Label htmlFor="customer-name">Full name *</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.customerName)}
                  aria-describedby={errors.customerName ? "customer-name-error" : undefined}
                />
                {errors.customerName && <p className="field-error" id="customer-name-error">{errors.customerName}</p>}
              </div>
              <div>
                <Label htmlFor="phone">Mobile number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="e.g. 6385743172"
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                {errors.phone && <p className="field-error" id="phone-error">{errors.phone}</p>}
              </div>
            </div>

            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-medium">How would you like to receive the items? *</legend>
              <RadioGroup value={fulfillment} onValueChange={(value) => setFulfillment(value as "delivery" | "collection")} className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="collection" id="fulfilment-collection" />
                  <Label htmlFor="fulfilment-collection" className="font-normal">Collect at the shop</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="delivery" id="fulfilment-delivery" />
                  <Label htmlFor="fulfilment-delivery" className="font-normal">Delivery</Label>
                </div>
              </RadioGroup>
            </fieldset>

            {fulfillment === "delivery" && (
              <div className="mt-5">
                <Label htmlFor="delivery-address">Delivery address *</Label>
                <Textarea
                  id="delivery-address"
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  rows={3}
                  aria-invalid={Boolean(errors.deliveryAddress)}
                  aria-describedby={errors.deliveryAddress ? "delivery-address-error" : undefined}
                />
                {errors.deliveryAddress && <p className="field-error" id="delivery-address-error">{errors.deliveryAddress}</p>}
              </div>
            )}

            <div className="mt-5">
              <Label htmlFor="notes">Order notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Sizes, colours, preferred brands, or anything the shop should know"
              />
            </div>

            {serverError && <p className="field-error mt-4" role="alert">{serverError}</p>}

            <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting}>
              {submitting ? "Preparing enquiry…" : "Send enquiry via WhatsApp"}
            </Button>
            <p className="form-hint mt-3">
              Submitting saves your enquiry with a reference number and opens WhatsApp addressed to the shop. The order
              is only an enquiry until the shop confirms it.
            </p>
          </form>

          <aside className="cart-summary">
            <h2 className="mb-3 text-lg">Your items</h2>
            {lines.map(({ product, quantity }) => (
              <div className="summary-line" key={product.id}>
                <span className="text-sm">
                  {product.name} <span className="text-[var(--color-muted-foreground)]">× {quantity}</span>
                </span>
                <span className="text-sm">{formatRupees(Math.round(productEffectivePrice(product) * quantity * 100) / 100)}</span>
              </div>
            ))}
            <div className="summary-line summary-total"><span>Subtotal</span><span>{formatRupees(subtotal)}</span></div>
            <p className="form-hint mt-2">The shop confirms the final price and any delivery cost with you.</p>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}

void (undefined as unknown as EnquiryRow | null);
