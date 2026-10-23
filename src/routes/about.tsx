import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/store/site-layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "About Sri Amman Marailaipagam and Senthivelan Hardwares." },
      { property: "og:title", content: "About Us | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "About Sri Amman Marailaipagam and Senthivelan Hardwares." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="shell-width" style={{ padding: "3rem 1rem" }}>
        <h1>About Us</h1>
        <p>About Sri Amman Marailaipagam and Senthivelan Hardwares.</p>
      </section>
    </SiteLayout>
  );
}
