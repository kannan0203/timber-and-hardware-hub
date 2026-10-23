import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/store/site-layout";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "All Products | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Browse timber, plywood, doors and hardware from our demo catalogue." },
      { property: "og:title", content: "All Products | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Browse timber, plywood, doors and hardware from our demo catalogue." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="shell-width" style={{ padding: "3rem 1rem" }}>
        <h1>All Products</h1>
        <p>Browse timber, plywood, doors and hardware from our demo catalogue.</p>
      </section>
    </SiteLayout>
  );
}
