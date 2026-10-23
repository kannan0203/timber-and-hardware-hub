import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/store/site-layout";

export const Route = createFileRoute("/timber")({
  head: () => ({
    meta: [
      { title: "Timber and Plywood | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Timber and plywood supplies in Aranthangi Taluk." },
      { property: "og:title", content: "Timber and Plywood | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Timber and plywood supplies in Aranthangi Taluk." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="shell-width" style={{ padding: "3rem 1rem" }}>
        <h1>Timber and Plywood</h1>
        <p>Timber and plywood supplies in Aranthangi Taluk.</p>
      </section>
    </SiteLayout>
  );
}
