import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type { CategoryInput, ProductInput, ProductPatch } from "@/lib/store.types";

function createPublicFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((value, name) => headers.set(name, value));
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

function makeStoreClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("The shop catalogue is temporarily unavailable.");
  return import("@supabase/supabase-js").then(({ createClient }) =>
    createClient<Database>(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: { fetch: createPublicFetch(key) },
    }),
  );
}

const imagePathSchema = z.string().trim().max(500).startsWith("product-images/");
const catalogSchema = z.object({ categorySlug: z.string().trim().max(80).optional() });

export const getCatalog = createServerFn({ method: "GET" })
  .inputValidator((input) => catalogSchema.parse(input))
  .handler(async ({ data }) => {
    const client = await makeStoreClient();
    const [{ data: categories, error: categoriesError }, { data: products, error: productsError }] =
      await Promise.all([
        client.from("store_categories").select("id, name, slug, division, description, image_url, display_order").eq("is_active", true).order("display_order"),
        client.from("store_products").select("*").eq("is_available", true).order("is_featured", { ascending: false }).order("name"),
      ]);
    if (categoriesError || productsError) throw new Error("We could not load the product catalogue.");
    const categoryById = new Map((categories ?? []).map((category) => [category.id, category]));
    const matching = (products ?? []).filter((product) => {
      if (!data.categorySlug) return true;
      return categoryById.get(product.category_id)?.slug === data.categorySlug;
    });
    const signedPaths = await Promise.all(matching.map(async (product) => {
      const path = imagePathSchema.safeParse(product.image_url);
      if (!path.success) return [product.id, product.image_url] as const;
      const { data: signed, error } = await client.storage.from("store-products").createSignedUrl(path.data, 31_536_000);
      return [product.id, error ? "/images/store-timber.jpg" : signed.signedUrl] as const;
    }));
    const imageById = new Map(signedPaths);
    return {
      categories: categories ?? [],
      products: matching.map((product) => {
        const category = categoryById.get(product.category_id);
        return {
          ...product,
          image_url: imageById.get(product.id) ?? product.image_url,
          category_name: category?.name ?? "General hardware",
          category_slug: category?.slug ?? "general-hardware",
          division: category?.division ?? "Hardware",
        };
      }),
    };
  });

const productIdSchema = z.object({ id: z.string().uuid() });
export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((input) => productIdSchema.parse(input))
  .handler(async ({ data }) => {
    const catalog = await getCatalog({ data: {} });
    const product = catalog.products.find((item) => item.id === data.id);
    return product ?? null;
  });

async function assertStoreAdmin(supabase: { rpc: (name: "has_role", args: { _user_id: string; _role: "admin" }) => Promise<{ data: boolean | null; error: unknown }> }, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error || !data) throw new Error("Only the shop owner can access this area.");
}

export const getAdminStore = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStoreAdmin(context.supabase, context.userId);
    const [{ data: categories, error: categoriesError }, { data: products, error: productsError }, { data: enquiries, error: enquiriesError }] =
      await Promise.all([
        context.supabase.from("store_categories").select("*").order("display_order"),
        context.supabase.from("store_products").select("*").order("created_at", { ascending: false }),
        context.supabase.from("store_enquiries").select("*").order("created_at", { ascending: false }).limit(100),
      ]);
    if (categoriesError || productsError || enquiriesError) throw new Error("Owner information could not be loaded.");
    return { categories: categories ?? [], products: products ?? [], enquiries: enquiries ?? [] };
  });

const productInputSchema = z.object({
  sku: z.string().trim().min(1).max(80),
  category_id: z.string().uuid(),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000),
  image_url: z.string().trim().min(1).max(1000),
  image_urls: z.array(z.string().trim().max(1000)).max(8),
  price: z.number().positive().max(1_000_000_000),
  discount_price: z.number().positive().max(1_000_000_000).nullable(),
  stock_quantity: z.number().int().nonnegative().nullable(),
  is_available: z.boolean(),
  unit: z.string().trim().min(1).max(40),
  size: z.string().trim().max(100).nullable(),
  material: z.string().trim().max(100).nullable(),
  color: z.string().trim().max(100).nullable(),
  brand: z.string().trim().max(100).nullable(),
  variants: z.array(z.object({ name: z.string().trim().max(80), options: z.array(z.string().trim().max(80)).max(20) })).max(20),
  is_demo: z.boolean(),
  is_featured: z.boolean(),
});

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid().optional(), product: productInputSchema }).parse(input))
  .handler(async ({ data, context }) => {
    await assertStoreAdmin(context.supabase, context.userId);
    if (data.product.discount_price !== null && data.product.discount_price >= data.product.price) {
      throw new Error("A discount must be less than the regular price.");
    }
    const update: ProductPatch = { ...data.product };
    const result = data.id
      ? await context.supabase.from("store_products").update(update).eq("id", data.id).select("id").single()
      : await context.supabase.from("store_products").insert(data.product as ProductInput).select("id").single();
    if (result.error) throw new Error(result.error.message.includes("store_products_sku_key") ? "That product ID is already in use." : "The product could not be saved.");
    return { id: result.data.id };
  });

export const removeProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => productIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertStoreAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("store_products").delete().eq("id", data.id);
    if (error) throw new Error("The product could not be removed.");
    return { success: true };
  });

const categoryInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  division: z.string().trim().min(2).max(80),
  description: z.string().trim().max(600),
  image_url: z.string().trim().min(1).max(1000),
  is_active: z.boolean(),
  display_order: z.number().int().min(0).max(10000),
});

export const saveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid().optional(), category: categoryInputSchema }).parse(input))
  .handler(async ({ data, context }) => {
    await assertStoreAdmin(context.supabase, context.userId);
    const result = data.id
      ? await context.supabase.from("store_categories").update(data.category).eq("id", data.id)
      : await context.supabase.from("store_categories").insert(data.category as CategoryInput);
    if (result.error) throw new Error("The category could not be saved. Check that its name and link are unique.");
    return { success: true };
  });

export const removeCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => productIdSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertStoreAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("store_categories").delete().eq("id", data.id);
    if (error) throw new Error("Move or remove the category’s products before deleting it.");
    return { success: true };
  });

const enquirySchema = z.object({
  idempotencyKey: z.string().uuid(),
  customerName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(10).max(25),
  fulfillment: z.enum(["delivery", "collection"]),
  deliveryAddress: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(1000).optional(),
  items: z.array(z.object({ id: z.string().uuid(), quantity: z.number().int().min(1).max(999) })).min(1).max(30),
});

export const submitStoreEnquiry = createServerFn({ method: "POST" })
  .inputValidator((input) => enquirySchema.parse(input))
  .handler(async ({ data }) => {
    const client = await makeStoreClient();
    const { data: result, error } = await client.rpc("submit_store_enquiry_v2", {
      p_idempotency_key: data.idempotencyKey,
      p_customer_name: data.customerName,
      p_phone: data.phone,
      p_fulfillment: data.fulfillment,
      p_delivery_address: data.deliveryAddress ?? "",
      p_notes: data.notes ?? "",
      p_items: data.items,
    });
    if (error || !result?.[0]) throw new Error(error?.message ?? "Your enquiry could not be prepared. Please try again.");
    return result[0] as { reference_code: string; subtotal: number; items: Array<{ id: string; name: string; sku: string; unit: string; quantity: number; unit_price: number; line_total: number }> };
  });

export const updateEnquiryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), status: z.enum(["pending", "contacted", "confirmed", "cancelled"]) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertStoreAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("store_enquiries").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error("The enquiry status could not be updated.");
    return { success: true };
  });