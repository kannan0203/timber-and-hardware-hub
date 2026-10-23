import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/store/site-layout";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Owner Sign In | Sri Amman & Senthivelan Hardwares" },
      { name: "description", content: "Sign in area for the shop owner." },
      { property: "og:title", content: "Owner Sign In | Sri Amman & Senthivelan Hardwares" },
      { property: "og:description", content: "Sign in area for the shop owner." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <section className="shell-width" style={{ padding: "3rem 1rem" }}>
        <h1>Owner Sign In</h1>
        <p>Sign in area for the shop owner.</p>
      </section>
    </SiteLayout>
  );
}
