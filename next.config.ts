import type { NextConfig } from "next";

// Room photography is served from the Supabase Storage bucket, so next/image
// needs that host on its allow-list. Scoped to the public object path of this
// one project rather than the whole hostname.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            port: "",
            pathname: "/storage/v1/object/public/**",
            search: "",
          },
        ]
      : [],
  },
};

export default nextConfig;
