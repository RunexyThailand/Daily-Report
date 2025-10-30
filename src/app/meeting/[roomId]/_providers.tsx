// src/app/meeting/[roomId]/_providers.tsx
"use client";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { loggerLink } from "@trpc/client";
import { httpBatchLink, splitLink, wsLink, createWSClient } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "@/trpc/client";

const WsCtx = React.createContext<{ wsReady: boolean }>({ wsReady: false });
export const useWsReady = () => React.useContext(WsCtx).wsReady;

export default function MeetingProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = React.useState(() => new QueryClient());
  const [wsReady, setWsReady] = React.useState(false);
  const [wsClient, setWsClient] = React.useState<ReturnType<
    typeof createWSClient
  > | null>(null);

  const httpUrl =
    process.env.NEXT_PUBLIC_TRPC_HTTP_URL ?? "http://localhost:3000/api/trpc";

  const wsProtocol =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "wss"
      : "ws";
  const wsUrl =
    process.env.NEXT_PUBLIC_TRPC_WS_URL ?? `${wsProtocol}://localhost:3001`;

  // ⭐ สร้าง WS client "หลัง mount" เท่านั้น
  React.useEffect(() => {
    // ป้องกันรันใน SSR
    if (typeof window === "undefined") return;

    const client = createWSClient({
      url: wsUrl,
      // จะต่อทันทีหลัง mount (ปลอดภัยแล้ว เพราะ component mount แล้ว)
      lazy: { enabled: false, closeMs: 0 },
      retryDelayMs: () => 1000,
      onOpen: () => {
        setWsReady(true);
        console.log("[ws] open");
      },
      onClose: (ev) => {
        setWsReady(false);
        console.warn("[ws] close", ev);
      },
      connectionParams: async () => ({
        authToken: localStorage.getItem("authToken") ?? undefined,
      }),
    });

    setWsClient(client);

    return () => {
      try {
        client.close(); // sync, ไม่คืน promise
      } catch {
        // ignore
      }
    };
  }, [wsUrl]);

  // ถ้า wsClient ยังไม่พร้อม -> ใช้ HTTP-only ไปก่อน (ไม่มี subscription)
  const trpcClient = React.useMemo(() => {
    if (!wsClient) {
      return trpc.createClient({
        links: [
          loggerLink(),
          httpBatchLink({ url: httpUrl, transformer: superjson }),
        ],
      });
    }
    // WS พร้อม -> splitLink ตามปกติ
    return trpc.createClient({
      links: [
        loggerLink(),
        splitLink({
          condition: (op) => op.type === "subscription",
          true: wsLink({ client: wsClient, transformer: superjson }),
          false: httpBatchLink({ url: httpUrl, transformer: superjson }),
        }),
      ],
    });
  }, [wsClient, httpUrl]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <WsCtx.Provider value={{ wsReady }}>{children}</WsCtx.Provider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
