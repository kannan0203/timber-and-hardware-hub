import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/store/site-layout";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Cart | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Review items in your cart before sending a WhatsApp enquiry." },
      { property: "og:title", content: "Shopping Cart | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Review items in your cart before sending a WhatsApp enquiry." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="shell-width" style={{ padding: "3rem 1rem" }}>
        <h1>Shopping Cart</h1>
        <p>Review items in your cart before sending a WhatsApp enquiry.</p>
      </section>
    </SiteLayout>
  );
}
