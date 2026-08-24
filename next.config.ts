import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma generates its client (including the native query-engine binary)
  // to a custom path (see `output` in prisma/schema.prisma) instead of the
  // default node_modules/.prisma/client. Next.js's output file tracing
  // can't statically see Prisma's dynamic require() of that binary, so on
  // Vercel it gets left out of the deployed function and every query fails
  // with "could not locate the Query Engine for runtime ...". This forces
  // the whole generated client directory into every route's trace.
  // https://pris.ly/d/engine-not-found-nextjs
  outputFileTracingIncludes: {
    "/*": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
