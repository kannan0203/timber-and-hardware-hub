import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/store/site-layout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Call or WhatsApp +91 6385743172. Thiruvapadi, Kattumavadi Road, Aranthangi Taluk, Pudukkottai – 614630." },
      { property: "og:title", content: "Contact Us | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Call or WhatsApp +91 6385743172. Thiruvapadi, Kattumavadi Road, Aranthangi Taluk, Pudukkottai – 614630." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="shell-width" style={{ padding: "3rem 1rem" }}>
        <h1>Contact Us</h1>
        <p>Call or WhatsApp +91 6385743172. Thiruvapadi, Kattumavadi Road, Aranthangi Taluk, Pudukkottai – 614630.</p>
      </section>
    </SiteLayout>
  );
}
