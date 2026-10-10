import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  async headers() {
    // Fotogramas, modelos y portadas pesan mucho y casi no cambian: una semana de caché en el
    // navegador. Los nombres no llevan hash, así que si se regeneran pueden tardar hasta 7 días
    // en verse en visitantes que ya los tenían (stale-while-revalidate los actualiza en segundo plano).
    const longCache = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }];
    return ["/sequences/:path*", "/models/:path*", "/textures/:path*"].map((source) => ({ source, headers: longCache }));
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
