import { createWSClient, wsLink } from "@trpc/client";
import type { AppRouter } from "@/server/routers";
import superjson from "superjson";

export function createMeetingTrpcClient() {
  const url = process.env.NEXT_PUBLIC_TRPC_WS_URL ?? "ws://localhost:3001";
  const wsClient = createWSClient({ url });

  const link = wsLink<AppRouter>({
    client: wsClient,
    transformer: superjson,
  });

  return {
    clientConfig: { links: [link] },
    wsClient,
  };
}
