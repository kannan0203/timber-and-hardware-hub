import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/store/site-layout";
import { CategoryListing } from "@/components/store/category-listing";
import { catalogQueryOptions } from "@/lib/catalog-queries";

export const Route = createFileRoute("/timber")({
  head: () => ({
    meta: [
      { title: "Timber & Plywood | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Wood sections and plywood sheets listed in our online catalogue. Demo prices — confirm with the shop." },
      { property: "og:title", content: "Timber & Plywood | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Wood sections and plywood sheets listed in our online catalogue." },
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
        title="Timber & plywood"
        description="Wood sections and plywood sheets for construction, carpentry and home work. Tell us your sizes — we quote and cut to suit."
        slugs={["timber"]}
      />
    </SiteLayout>
  );
}
