import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/store/site-layout";

export const Route = createFileRoute("/doors")({
  head: () => ({
    meta: [
      { title: "Doors and Wooden Frames | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Doors and wooden frames for homes and buildings." },
      { property: "og:title", content: "Doors and Wooden Frames | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Doors and wooden frames for homes and buildings." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="shell-width" style={{ padding: "3rem 1rem" }}>
        <h1>Doors and Wooden Frames</h1>
        <p>Doors and wooden frames for homes and buildings.</p>
      </section>
    </SiteLayout>
  );
}
