"use client";
import { trpc } from "@/trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import superjson from "superjson";
import { httpBatchLink } from "@trpc/client"; // ⬅️ เพิ่มอันนี้

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: "/api/trpc",
                    // ⬇️ ย้ายมาไว้ที่ link
                    transformer: superjson,
                    // ถ้าใช้ tRPC v11 ให้ใช้ `dataTransformer` แทน:
                    // dataTransformer: superjson,
                }),
            ],
        }),
    );

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </trpc.Provider>
    );
}
