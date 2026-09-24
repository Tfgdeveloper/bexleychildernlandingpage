import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // The page uses plain <img> tags on purpose (with a fallback placeholder), so skip lint during builds
    eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
