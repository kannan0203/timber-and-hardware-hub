import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/store/site-layout";
import { CategoryListing } from "@/components/store/category-listing";
import { catalogQueryOptions } from "@/lib/catalog-queries";

export const Route = createFileRoute("/doors")({
  head: () => ({
    meta: [
      { title: "Doors & Wooden Frames | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Doors, wooden frames and window sets in our online catalogue. Demo prices — confirm with the shop." },
      { property: "og:title", content: "Doors & Wooden Frames | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Doors, wooden frames and window sets in our online catalogue." },
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
        eyebrow="Division: Sri Amman Marailaipagam"
        title="Doors & wooden frames"
        description="Doors, frames and window sets ready for your build. Share your measurements and we will confirm what we can supply."
        slugs={["doors"]}
      />
    </SiteLayout>
  );
}
