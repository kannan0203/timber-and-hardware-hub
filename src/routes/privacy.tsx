import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/store/site-layout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "How we handle the details you share with us." },
      { property: "og:title", content: "Privacy Policy | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "How we handle the details you share with us." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="shell-width" style={{ padding: "3rem 1rem" }}>
        <h1>Privacy Policy</h1>
        <p>How we handle the details you share with us.</p>
      </section>
    </SiteLayout>
  );
}
