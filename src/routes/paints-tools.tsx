import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/store/site-layout";
import { CategoryListing } from "@/components/store/category-listing";

export const Route = createFileRoute("/paints-tools")({
  head: () => ({
    meta: [
      { title: "Paints & Tools | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Paints, primers and hand tools for site and home. Demo prices — confirm with the shop." },
      { property: "og:title", content: "Paints & Tools | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Paints, primers and hand tools for site and home." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQueryOptions()),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <CategoryListing
        eyebrow="Division: Senthivelan Hardwares"
        title="Paints & tools"
        description="Paints and finishes plus everyday hand tools for site and home work. Ask us which product suits your surface."
        slugs={["paints", "hand-tools"]}
      />
    </SiteLayout>
  );
}
