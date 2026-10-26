import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteLayout } from "@/components/store/site-layout";
import { useStoreCart } from "@/hooks/use-store-cart";
import { supabase } from "@/integrations/supabase/client";
import {
  getAdminStore,
  removeCategory,
  removeProduct,
  saveCategory,
  saveProduct,
  updateEnquiryStatus,
} from "@/lib/store.functions";
import {
  formatRupees,
  type CategoryInput,
  type CategoryRow,
  type EnquiryRow,
  type ProductInput,
  type ProductRow,
} from "@/lib/store.types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Protected dashboard for the shop owner." },
      { property: "og:title", content: "Owner Dashboard | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Protected dashboard for the shop owner." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OwnerDashboardPage,
});

const ADMIN_STORE_KEY = ["admin-store"] as const;
const STATUS_LABELS: Record<EnquiryRow["status"], string> = {
  pending: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

type EnquiryItem = { name: string; sku: string; unit: string; quantity: number; unit_price: number; line_total: number };

function whatsappFor(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
}

function publicImageUrl(url: string) {
  if (url.startsWith("http")) return url;
  return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/store-products/${url}`;
}

function OwnerDashboardPage() {
  const { signedIn } = useStoreCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!signedIn) navigate({ to: "/admin-login", replace: true });
  }, [signedIn, navigate]);

  return (
    <SiteLayout>
      {signedIn ? <Dashboard /> : (
        <section className="shell-width" style={{ padding: "3rem 1rem" }}>
          <h1 className="text-2xl">Owner dashboard</h1>
          <p className="mt-2 text-muted-foreground">Sign in as the shop owner to manage products and enquiries.</p>
          <Button asChild className="mt-4">
            <Link to="/admin-login">Go to owner sign in</Link>
          </Button>
        </section>
      )}
    </SiteLayout>
  );
}

function Dashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({ queryKey: ADMIN_STORE_KEY, queryFn: () => getAdminStore() });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin-login", replace: true });
  }

  if (error) {
    return (
      <div className="shell-width" style={{ padding: "2.5rem 0 3.5rem" }}>
        <h1 className="text-2xl">Owner dashboard</h1>
        <p className="mt-2 text-destructive">{error instanceof Error ? error.message : "Owner information could not be loaded."}</p>
      </div>
    );
  }

  return (
    <div className="shell-width" style={{ padding: "2.5rem 0 3.5rem" }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Owner desk</p>
          <h1 className="text-3xl">Owner dashboard</h1>
          <p className="mt-1 text-muted-foreground">Enquiries, products and categories for the shop.</p>
        </div>
        <Button variant="outline" onClick={() => void handleSignOut()}>
          <LogOut size={16} /> Sign out
        </Button>
      </div>

      {isLoading || !data ? (
        <p className="mt-8 text-muted-foreground">Loading the shop information…</p>
      ) : (
        <>
          <EnquiriesPanel enquiries={data.enquiries} />
          <ProductsPanel products={data.products} categories={data.categories} />
          <CategoriesPanel categories={data.categories} />
        </>
      )}
    </div>
  );
}

function useAdminMutation<TInput, TResult>(opts: {
  mutationFn: (input: TInput) => Promise<TResult>;
  successMessage: string;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: opts.mutationFn,
    onSuccess: () => {
      toast.success(opts.successMessage);
      void queryClient.invalidateQueries({ queryKey: ADMIN_STORE_KEY });
    },
    onError: (cause) => toast.error(cause instanceof Error ? cause.message : "That change could not be saved."),
  });
}

function EnquiriesPanel({ enquiries }: { enquiries: EnquiryRow[] }) {
  const statusMutation = useAdminMutation({
    mutationFn: (input: { id: string; status: EnquiryRow["status"] }) => updateEnquiryStatus({ data: input }),
    successMessage: "Enquiry status updated.",
  });

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-foreground">Customer enquiries</h2>
      <p className="text-sm text-muted-foreground">{enquiries.length} enquiry{enquiries.length === 1 ? "" : "ies"} in total.</p>
      {enquiries.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          No enquiries yet. Customer lists sent from the checkout page appear here.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {enquiries.map((enquiry) => {
            const items = (enquiry.items ?? []) as EnquiryItem[];
            return (
              <article key={enquiry.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {enquiry.reference_code} · {enquiry.customer_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(enquiry.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`tel:${enquiry.phone}`} className="text-sm underline underline-offset-4" aria-label={`Call ${enquiry.customer_name}`}>
                      {enquiry.phone}
                    </a>
                    <a href={whatsappFor(enquiry.phone)} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">
                      WhatsApp
                    </a>
                    <Select
                      value={enquiry.status}
                      onValueChange={(value) => statusMutation.mutate({ id: enquiry.id, status: value as EnquiryRow["status"] })}
                    >
                      <SelectTrigger className="w-[140px]" aria-label="Enquiry status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STATUS_LABELS) as EnquiryRow["status"][]).map((key) => (
                          <SelectItem key={key} value={key}>{STATUS_LABELS[key]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <dl className="mt-3 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                  <div><dt className="inline font-medium text-foreground">Fulfilment: </dt><dd className="inline">{enquiry.fulfillment}</dd></div>
                  {enquiry.delivery_address ? <div><dt className="inline font-medium text-foreground">Address: </dt><dd className="inline">{enquiry.delivery_address}</dd></div> : null}
                  {enquiry.notes ? <div className="sm:col-span-2"><dt className="inline font-medium text-foreground">Notes: </dt><dd className="inline">{enquiry.notes}</dd></div> : null}
                </dl>
                <ul className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
                  {items.map((item, index) => (
                    <li key={`${enquiry.id}-${index}`} className="flex flex-wrap justify-between gap-2">
                      <span>{item.name} ({item.sku}) — {item.quantity} {item.unit}</span>
                      <span>{formatRupees(item.line_total)}</span>
                    </li>
                  ))}
                  <li className="flex flex-wrap justify-between gap-2 font-semibold text-foreground">
                    <span>Subtotal</span>
                    <span>{formatRupees(enquiry.subtotal)}</span>
                  </li>
                </ul>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

type ProductForm = {
  id: string | null;
  sku: string;
  name: string;
  category_id: string;
  unit: string;
  price: string;
  discount_price: string;
  stock_quantity: string;
  description: string;
  image_url: string;
  size: string;
  material: string;
  color: string;
  brand: string;
  variants: string;
  is_available: boolean;
  is_demo: boolean;
  is_featured: boolean;
};

function blankForm(categoryId: string): ProductForm {
  return {
    id: null,
    sku: "",
    name: "",
    category_id: categoryId,
    unit: "",
    price: "",
    discount_price: "",
    stock_quantity: "",
    description: "",
    image_url: "",
    size: "",
    material: "",
    color: "",
    brand: "",
    variants: "",
    is_available: true,
    is_demo: true,
    is_featured: false,
  };
}

function formFromProduct(row: ProductRow): ProductForm {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category_id: row.category_id,
    unit: row.unit,
    price: String(row.price),
    discount_price: row.discount_price == null ? "" : String(row.discount_price),
    stock_quantity: row.stock_quantity == null ? "" : String(row.stock_quantity),
    description: row.description ?? "",
    image_url: row.image_url ?? "",
    size: row.size ?? "",
    material: row.material ?? "",
    color: row.color ?? "",
    brand: row.brand ?? "",
    variants: row.variants == null ? "" : JSON.stringify(row.variants, null, 2),
    is_available: row.is_available,
    is_demo: row.is_demo,
    is_featured: row.is_featured,
  };
}

function parseVariants(text: string): ProductInput["variants"] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error('Variants must be valid JSON, e.g. [{"name":"Size","options":["6 inch","8 inch"]}].');
  }
  if (!Array.isArray(parsed)) throw new Error("Variants must be a JSON array.");
  return parsed.map((entry) => {
    if (!entry || typeof entry !== "object") throw new Error("Each variant needs a name and an options list.");
    const { name, options } = entry as { name?: unknown; options?: unknown };
    if (typeof name !== "string" || !Array.isArray(options) || options.some((option) => typeof option !== "string")) {
      throw new Error("Each variant needs a name and an options list of text values.");
    }
    return { name, options };
  });
}

function buildProductInput(form: ProductForm): ProductInput {
  const price = Number(form.price);
  if (!Number.isFinite(price) || price <= 0) throw new Error("Enter a regular price greater than zero.");
  const discount = form.discount_price.trim() === "" ? null : Number(form.discount_price);
  if (discount !== null && (!Number.isFinite(discount) || discount <= 0)) throw new Error("The offer price must be a positive number.");
  if (discount !== null && discount >= price) throw new Error("The offer price must be less than the regular price.");
  const stock = form.stock_quantity.trim() === "" ? null : Number(form.stock_quantity);
  if (stock !== null && (!Number.isInteger(stock) || stock < 0)) throw new Error("Stock must be a whole number of 0 or more.");
  if (!form.category_id) throw new Error("Choose a category.");
  return {
    sku: form.sku.trim(),
    category_id: form.category_id,
    name: form.name.trim(),
    description: form.description.trim(),
    image_url: form.image_url.trim(),
    image_urls: [],
    price,
    discount_price: discount,
    stock_quantity: stock,
    is_available: form.is_available,
    unit: form.unit.trim(),
    size: form.size.trim() || null,
    material: form.material.trim() || null,
    color: form.color.trim() || null,
    brand: form.brand.trim() || null,
    variants: parseVariants(form.variants),
    is_demo: form.is_demo,
    is_featured: form.is_featured,
  };
}

function ProductsPanel({ products, categories }: { products: ProductRow[]; categories: CategoryRow[] }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(() => blankForm(categories[0]?.id ?? ""));
  const [uploading, setUploading] = useState(false);

  const saveMutation = useAdminMutation({
    mutationFn: (input: { id?: string; product: ProductInput }) => saveProduct({ data: input }),
    successMessage: "Product saved.",
  });
  const removeMutation = useAdminMutation({
    mutationFn: (id: string) => removeProduct({ data: { id } }),
    successMessage: "Product removed.",
  });

  function openNew() {
    setForm(blankForm(categories[0]?.id ?? ""));
    setOpen(true);
  }

  function openEdit(row: ProductRow) {
    setForm(formFromProduct(row));
    setOpen(true);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase();
      const path = `product-images/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("store-products").upload(path, file, {
        upsert: true,
        contentType: file.type || undefined,
      });
      if (uploadError) throw new Error(uploadError.message);
      setForm((current) => ({ ...current, image_url: path }));
      toast.success("Image uploaded.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "The image could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const product = buildProductInput(form);
      await saveMutation.mutateAsync({ ...(form.id ? { id: form.id } : {}), product });
      setOpen(false);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "The product could not be saved.");
    }
  }

  async function handleRemove(row: ProductRow) {
    if (!window.confirm(`Remove “${row.name}” from the catalogue?`)) return;
    await removeMutation.mutateAsync(row.id);
  }

  const setField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground">Products</h2>
        <Button onClick={openNew}><Plus size={16} /> Add product</Button>
      </div>
      <p className="text-sm text-muted-foreground">{products.length} product{products.length === 1 ? "" : "s"} in the catalogue.</p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Flags</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-3 py-2">
                  <span className="font-medium text-foreground">{row.name}</span>
                  <span className="block text-xs text-muted-foreground">{row.sku}</span>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{categories.find((c) => c.id === row.category_id)?.name ?? "—"}</td>
                <td className="px-3 py-2">{formatRupees(row.discount_price ?? row.price)}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.stock_quantity == null ? "Not tracked" : row.stock_quantity}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {[row.is_demo && "Demo", row.is_featured && "Featured", !row.is_available && "Hidden"].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(row)} aria-label={`Edit ${row.name}`}>
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void handleRemove(row)} aria-label={`Remove ${row.name}`}>
                    <Trash2 size={14} /> Remove
                  </Button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">No products yet. Add the first one.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit product" : "Add product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(event) => void handleSubmit(event)} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="p-name">Name</Label>
              <Input id="p-name" required value={form.name} onChange={(e) => setField("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-sku">Product ID (SKU)</Label>
              <Input id="p-sku" required value={form.sku} onChange={(e) => setField("sku", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={(value) => setField("category_id", value)}>
                <SelectTrigger aria-label="Category"><SelectValue placeholder="Choose a category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-price">Regular price (₹)</Label>
              <Input id="p-price" type="number" min="1" step="0.01" required value={form.price} onChange={(e) => setField("price", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-discount">Offer price (₹, optional)</Label>
              <Input id="p-discount" type="number" min="1" step="0.01" value={form.discount_price} onChange={(e) => setField("discount_price", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-stock">Stock (leave empty to not track)</Label>
              <Input id="p-stock" type="number" min="0" step="1" value={form.stock_quantity} onChange={(e) => setField("stock_quantity", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-unit">Selling unit</Label>
              <Input id="p-unit" required placeholder="e.g. piece, sq ft, kg" value={form.unit} onChange={(e) => setField("unit", e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="p-description">Description</Label>
              <Textarea id="p-description" rows={3} value={form.description} onChange={(e) => setField("description", e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="p-image">Product image</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  id="p-image"
                  className="flex-1"
                  placeholder="Paste an image link, or upload a photo"
                  value={form.image_url}
                  onChange={(e) => setField("image_url", e.target.value)}
                />
                <Label
                  htmlFor="p-image-file"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  {uploading ? "Uploading…" : "Upload photo"}
                </Label>
                <Input
                  id="p-image-file"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleUpload(file);
                    e.target.value = "";
                  }}
                />
              </div>
              {form.image_url ? (
                <img
                  src={publicImageUrl(form.image_url)}
                  alt="Product preview"
                  className="mt-2 h-24 w-24 rounded-md border border-border object-cover"
                />
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-size">Size (optional)</Label>
              <Input id="p-size" value={form.size} onChange={(e) => setField("size", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-material">Material (optional)</Label>
              <Input id="p-material" value={form.material} onChange={(e) => setField("material", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-color">Colour (optional)</Label>
              <Input id="p-color" value={form.color} onChange={(e) => setField("color", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-brand">Brand (optional)</Label>
              <Input id="p-brand" value={form.brand} onChange={(e) => setField("brand", e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="p-variants">Variants (optional JSON)</Label>
              <Textarea
                id="p-variants"
                rows={3}
                placeholder={'[{"name":"Size","options":["6 inch","8 inch"]}]'}
                value={form.variants}
                onChange={(e) => setField("variants", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3"><Switch id="p-available" checked={form.is_available} onCheckedChange={(v) => setField("is_available", v)} /><Label htmlFor="p-available">Shown to customers</Label></div>
            <div className="flex items-center gap-3"><Switch id="p-demo" checked={form.is_demo} onCheckedChange={(v) => setField("is_demo", v)} /><Label htmlFor="p-demo">Demo price (illustrative)</Label></div>
            <div className="flex items-center gap-3"><Switch id="p-featured" checked={form.is_featured} onCheckedChange={(v) => setField("is_featured", v)} /><Label htmlFor="p-featured">Featured on the home page</Label></div>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving…" : form.id ? "Save changes" : "Add product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

type CategoryForm = {
  id: string | null;
  name: string;
  slug: string;
  division: string;
  description: string;
  image_url: string;
  display_order: string;
  is_active: boolean;
};

function blankCategoryForm(): CategoryForm {
  return { id: null, name: "", slug: "", division: "", description: "", image_url: "", display_order: "50", is_active: true };
}

function formFromCategory(row: CategoryRow): CategoryForm {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    division: row.division,
    description: row.description ?? "",
    image_url: row.image_url ?? "",
    display_order: String(row.display_order),
    is_active: row.is_active,
  };
}

function CategoriesPanel({ categories }: { categories: CategoryRow[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CategoryForm>(blankCategoryForm);

  const saveMutation = useAdminMutation({
    mutationFn: (input: { id?: string; category: CategoryInput }) => saveCategory({ data: input }),
    successMessage: "Category saved.",
  });
  const removeMutation = useAdminMutation({
    mutationFn: (id: string) => removeCategory({ data: { id } }),
    successMessage: "Category removed.",
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const displayOrder = Number(form.display_order);
    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      toast.error("Display order must be a whole number of 0 or more.");
      return;
    }
    const category: CategoryInput = {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
      division: form.division.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim(),
      is_active: form.is_active,
      display_order: displayOrder,
    };
    try {
      await saveMutation.mutateAsync({ ...(form.id ? { id: form.id } : {}), category });
      setOpen(false);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "The category could not be saved.");
    }
  }

  async function handleRemove(row: CategoryRow) {
    if (!window.confirm(`Remove the “${row.name}” category? Its products must be moved or removed first.`)) return;
    await removeMutation.mutateAsync(row.id);
  }

  const setField = <K extends keyof CategoryForm>(key: K, value: CategoryForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground">Categories</h2>
        <Button variant="outline" onClick={() => { setForm(blankCategoryForm()); setOpen(true); }}>
          <Plus size={16} /> Add category
        </Button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Division</th>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-3 py-2 font-medium text-foreground">{row.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.division}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.display_order}</td>
                <td className="px-3 py-2 text-muted-foreground">{row.is_active ? "Shown" : "Hidden"}</td>
                <td className="px-3 py-2 text-right">
                  <Button variant="ghost" size="sm" onClick={() => { setForm(formFromCategory(row)); setOpen(true); }} aria-label={`Edit ${row.name}`}>
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void handleRemove(row)} aria-label={`Remove ${row.name}`}>
                    <Trash2 size={14} /> Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit category" : "Add category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(event) => void handleSubmit(event)} className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Name</Label>
              <Input id="c-name" required value={form.name} onChange={(e) => setField("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-slug">Link name (lowercase, e.g. timber)</Label>
              <Input id="c-slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} onChange={(e) => setField("slug", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-division">Shop division</Label>
              <Input id="c-division" required placeholder="e.g. Timber, Hardware" value={form.division} onChange={(e) => setField("division", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-description">Description</Label>
              <Textarea id="c-description" rows={2} value={form.description} onChange={(e) => setField("description", e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="c-order">Display order</Label>
                <Input id="c-order" type="number" min="0" step="1" value={form.display_order} onChange={(e) => setField("display_order", e.target.value)} />
              </div>
              <div className="flex items-center gap-3 pt-6"><Switch id="c-active" checked={form.is_active} onCheckedChange={(v) => setField("is_active", v)} /><Label htmlFor="c-active">Shown to customers</Label></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-image">Category image link (optional)</Label>
              <Input id="c-image" value={form.image_url} onChange={(e) => setField("image_url", e.target.value)} />
            </div>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving…" : form.id ? "Save changes" : "Add category"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
