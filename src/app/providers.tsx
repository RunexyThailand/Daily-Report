"use client";

import { trpc } from "@/trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import superjson from "superjson";
import { httpBatchLink } from "@trpc/client";
import { LayoutProvider } from "@/components/layout/layout-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  // React Query client
  const [queryClient] = useState(() => new QueryClient());

  // tRPC client
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson, // ✅ ใส่ transformer ตรง link (ตาม v11)
          // ถ้าต้องส่ง cookie/session:
          // fetch: (input, init) => fetch(input, { ...init, credentials: "include" }),
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <LayoutProvider>{children}</LayoutProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
