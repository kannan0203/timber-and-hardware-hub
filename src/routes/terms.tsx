import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/store/site-layout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Terms for using this website and sending enquiries." },
      { property: "og:title", content: "Terms and Conditions | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Terms for using this website and sending enquiries." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="shell-width" style={{ padding: "3rem 1rem" }}>
        <h1>Terms and Conditions</h1>
        <p>Terms for using this website and sending enquiries.</p>
      </section>
    </SiteLayout>
  );
}
