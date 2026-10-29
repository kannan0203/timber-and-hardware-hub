import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, Hammer, MapPin, Phone, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/store/site-layout";
import { ProductCard } from "@/components/store/product-card";
import { catalogQueryOptions } from "@/lib/catalog-queries";
import { businessPhone, shopAddress, buildWhatsAppUrl } from "@/lib/store.types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sri Amman & Senthivelan Hardwares | Quality Timber. Reliable Hardware." },
      { name: "description", content: "Your trusted destination for timber, plywood, doors, and hardware supplies in Aranthangi Taluk, Pudukkottai District, Tamil Nadu." },
      { property: "og:title", content: "Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Your trusted destination for timber, plywood, doors, and hardware supplies in Pudukkottai District, Tamil Nadu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions()),
  component: Index,
});

const CATEGORY_LINKS: Record<string, { to: "/timber" | "/doors" | "/hardware" | "/paints-tools"; blurb: string }> = {
  "timber": { to: "/timber", blurb: "Seasoned wood sections and plywood sheets" },
  "doors": { to: "/doors", blurb: "Doors, frames and window sets" },
  "paints": { to: "/paints-tools", blurb: "Enamels, primers and finishes" },
  "hand-tools": { to: "/paints-tools", blurb: "Everyday hand tools for site and home" },
  "nails-screws": { to: "/hardware", blurb: "Fasteners in every common size" },
  "locks-hinges": { to: "/hardware", blurb: "Locks, hinges and door furniture" },
  "general-hardware": { to: "/hardware", blurb: "Fittings and general supplies" },
};

function Index() {
  const { data } = useSuspenseQuery(catalogQueryOptions());
  const featured = data.products.filter((product) => product.is_featured).slice(0, 8);
  const categories = data.categories.slice(0, 4);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopAddress)}`;

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="hero">
        <div className="shell-width hero-inner">
          <div>
            <p className="hero-eyebrow">Sri Amman Marailaipagam &amp; Senthivelan Hardwares</p>
            <h1>Quality Timber. Reliable Hardware.</h1>
            <p className="hero-sub">
              Your trusted destination for timber, plywood, doors, and hardware supplies — serving builders, carpenters
              and households around Aranthangi Taluk, Pudukkottai District.
            </p>
            <div className="hero-actions">
              <Button asChild size="lg" className="bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent)] hover:brightness-105">
                <Link to="/products">Shop Products</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-[oklch(1_0_0/40%)] text-[var(--color-primary-foreground)] hover:text-[var(--color-primary-foreground)] hover:bg-[oklch(1_0_0/12%)]">
                <a href={buildWhatsAppUrl("Hello, I would like to enquire about timber and hardware supplies.")} target="_blank" rel="noreferrer">
                  Enquire on WhatsApp <ArrowUpRight size={16} />
                </a>
              </Button>
            </div>
          </div>
          <div className="hero-media">
            <img src="/images/store-doors.jpg" alt="Wooden doors and frames displayed at the shop" />
          </div>
        </div>
      </section>

      {/* Featured categories */}
      <section className="section">
        <div className="shell-width">
          <div className="section-head">
            <p className="eyebrow">Browse by range</p>
            <h2>Featured categories</h2>
          </div>
          <div className="category-grid">
            {categories.map((category) => {
              const link = CATEGORY_LINKS[category.slug] ?? { to: "/products" as const, blurb: "" };
              return (
                <Link key={category.id} to={link.to} className="category-card">
                  <img src={category.image_url || "/images/store-hardware.jpg"} alt={category.name} loading="lazy" />
                  <div className="category-card-overlay">
                    <div>
                      <h3>{category.name}</h3>
                      <small>{link.blurb}</small>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular products */}
      <section className="section section-alt">
        <div className="shell-width">
          <div className="section-head">
            <p className="eyebrow">From the catalogue</p>
            <h2>Popular products</h2>
            <p>Sample listings with demo prices so you can see how the shop works. The owner will replace these with real products and prices.</p>
          </div>
          {featured.length === 0 ? (
            <div className="store-empty">
              <h3>Products are being added</h3>
              <p>The catalogue is being filled in. Please call or WhatsApp the shop for current availability.</p>
            </div>
          ) : (
            <div className="product-grid">
              {featured.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
          <div className="mt-6">
            <Button asChild variant="secondary">
              <Link to="/products">View all products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Two divisions */}
      <section className="section">
        <div className="shell-width">
          <div className="section-head">
            <p className="eyebrow">Under one roof</p>
            <h2>Two divisions, one dependable shop</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-[var(--color-card)] p-6">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-accent)]"><Sprout size={22} /></div>
              <h3 className="text-xl">Sri Amman Marailaipagam</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                The timber and wood side of the shop — wood sections, plywood sheets, doors and wooden frames for
                construction, carpentry and home work. Tell us your sizes and we will quote and cut accordingly.
              </p>
              <Button asChild size="sm" variant="secondary" className="mt-4">
                <Link to="/timber">Browse timber &amp; plywood</Link>
              </Button>
            </div>
            <div className="rounded-2xl border bg-[var(--color-card)] p-6">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-accent)]"><Hammer size={22} /></div>
              <h3 className="text-xl">Senthivelan Hardwares</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                The hardware side — paints, hand tools, nails, screws, locks, hinges and everyday fittings. Practical
                supplies for masons, carpenters and households, with guidance on what suits your job.
              </p>
              <Button asChild size="sm" variant="secondary" className="mt-4">
                <Link to="/hardware">Browse hardware</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="section section-alt">
        <div className="shell-width">
          <div className="section-head">
            <p className="eyebrow">Why choose us?</p>
            <h2>Simple, honest service</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Everything for your build", body: "Timber, doors, paints and fittings from one shop, so you spend less time running around." },
              { title: "Guidance before you buy", body: "Not sure what grade of plywood or which lock you need? Ask us — we help you choose what fits the job." },
              { title: "Straightforward pricing", body: "Clear, itemised quotes. Online prices shown as DEMO are illustrative until confirmed by the shop." },
              { title: "Order without an account", body: "Send your list on WhatsApp or use the enquiry form — no sign-up needed to place an enquiry." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border bg-[var(--color-card)] p-5">
                <h3 className="text-base">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted-foreground)]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section">
        <div className="shell-width">
          <div className="section-head">
            <p className="eyebrow">Visit or call</p>
            <h2>Come to the shop, or reach us on WhatsApp</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="contact-card">
              <div className="contact-line"><MapPin size={18} /><p>{shopAddress}</p></div>
              <div className="contact-line">
                <Phone size={18} />
                <p><a href={`tel:+${businessPhone}`}>+91 63857 43172</a></p>
              </div>
              <p className="form-hint">Opening hours are not published online — please call or WhatsApp to confirm timings before visiting.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="justify-start bg-[var(--color-primary)]">
                <a href={`https://wa.me/${businessPhone}`} target="_blank" rel="noreferrer">
                  WhatsApp the shop <ArrowUpRight size={16} />
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary" className="justify-start">
                <a href={`tel:+${businessPhone}`}>Call the shop</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="justify-start">
                <a href={mapsUrl} target="_blank" rel="noreferrer">Get directions on Google Maps</a>
              </Button>
              <p className="form-hint">The map link opens Google Maps with our address — please verify the pin before travelling.</p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
