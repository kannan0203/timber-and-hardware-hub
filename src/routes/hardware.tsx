import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/store/site-layout";
import { CategoryListing } from "@/components/store/category-listing";
import { catalogQueryOptions } from "@/lib/catalog-queries";

export const Route = createFileRoute("/hardware")({
  head: () => ({
    meta: [
      { title: "Hardware | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Nails, screws, locks, hinges and general hardware fittings. Demo prices — confirm with the shop." },
      { property: "og:title", content: "Hardware | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Nails, screws, locks, hinges and general hardware fittings." },
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
        title="Hardware"
        description="Nails and screws, locks and hinges, and general fittings — the everyday supplies that keep a job moving."
        slugs={["nails-screws", "locks-hinges", "general-hardware"]}
      />
    </SiteLayout>
  );
}
