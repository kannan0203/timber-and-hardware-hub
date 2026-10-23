import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/store/site-layout";

export const Route = createFileRoute("/paints-tools")({
  head: () => ({
    meta: [
      { title: "Paints and Tools | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Paints and hand tools for your projects." },
      { property: "og:title", content: "Paints and Tools | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Paints and hand tools for your projects." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="shell-width" style={{ padding: "3rem 1rem" }}>
        <h1>Paints and Tools</h1>
        <p>Paints and hand tools for your projects.</p>
      </section>
    </SiteLayout>
  );
}
