import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/auth", "@workspace/db", "@workspace/api"],
}

export default nextConfig
