import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";

function productionSeo(siteUrl: string): Plugin {
  const homepage = URL.canParse(siteUrl) ? new URL(siteUrl) : undefined;
  if (
    !homepage
    || homepage.protocol !== "https:"
    || homepage.href !== `${homepage.origin}/`
    || !/^(?:[a-z0-9.-]+|\[[a-f0-9:]+\])$/i.test(homepage.hostname)
  ) {
    throw new Error("SITE_URL must be an HTTPS origin, such as https://tracker.example.com.");
  }

  return {
    name: "production-seo",
    apply: "build",
    transformIndexHtml() {
      const imageUrl = new URL("social-preview.png", homepage).href;
      return [
        { tag: "link", attrs: { rel: "canonical", href: homepage.href } },
        { tag: "meta", attrs: { property: "og:url", content: homepage.href } },
        { tag: "meta", attrs: { property: "og:image", content: imageUrl } },
        { tag: "meta", attrs: { property: "og:image:type", content: "image/png" } },
        { tag: "meta", attrs: { property: "og:image:width", content: "1200" } },
        { tag: "meta", attrs: { property: "og:image:height", content: "630" } },
        { tag: "meta", attrs: { property: "og:image:alt", content: "Harptos Calendar Tracker title beside a gold clock dial" } },
        { tag: "meta", attrs: { name: "twitter:card", content: "summary_large_image" } },
        {
          tag: "script",
          attrs: { type: "application/ld+json" },
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Harptos Calendar Tracker",
            url: homepage.href,
          }),
        },
      ].map((tag) => ({ ...tag, injectTo: "head" as const }));
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${homepage.href}</loc></url>\n</urlset>\n`,
      });
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nDisallow:\n\nSitemap: ${new URL("sitemap.xml", homepage).href}\n`,
      });
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const siteUrl = loadEnv(mode, process.cwd(), "SITE_URL").SITE_URL || "https://harptos.starmist.studio/";
  return {
    plugins: [react(), tailwindcss(), command === "build" && productionSeo(siteUrl)],
    resolve: { tsconfigPaths: true },
  };
});
