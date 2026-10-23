import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/store/site-layout";

export const Route = createFileRoute("/hardware")({
  head: () => ({
    meta: [
      { title: "Hardware | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Nails, screws, locks, hinges and general hardware." },
      { property: "og:title", content: "Hardware | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Nails, screws, locks, hinges and general hardware." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="shell-width" style={{ padding: "3rem 1rem" }}>
        <h1>Hardware</h1>
        <p>Nails, screws, locks, hinges and general hardware.</p>
      </section>
    </SiteLayout>
  );
}
