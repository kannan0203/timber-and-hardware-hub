import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/store/site-layout";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Protected dashboard for the shop owner." },
      { property: "og:title", content: "Owner Dashboard | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Protected dashboard for the shop owner." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="shell-width" style={{ padding: "3rem 1rem" }}>
        <h1>Owner Dashboard</h1>
        <p>Protected dashboard for the shop owner.</p>
      </section>
    </SiteLayout>
  );
}
