"use client";

import { trpc } from "@/trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import superjson from "superjson";
import { httpBatchLink } from "@trpc/client";

export default function Providers({ children }: { children: React.ReactNode }) {
    // สร้าง react-query client
    const [queryClient] = useState(() => new QueryClient());

    // สร้าง trpc client
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: "/api/trpc",
                    // tRPC v10
                    transformer: superjson,
                    // ถ้าใช้ tRPC v11 ให้เปลี่ยนเป็น:
                    // dataTransformer: superjson,
                }),
            ],
        })
    );

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    );
}
