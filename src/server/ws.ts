import { WebSocketServer } from "ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { appRouter } from "@/server/routers";
import { createTRPCContext } from "@/server/trpc";

const wss = new WebSocketServer({ port: 3001 });

applyWSSHandler({
  wss,
  router: appRouter,
  // ⬅️ สำคัญมาก: ส่ง opts เข้าไป
  createContext: (opts) => createTRPCContext(opts),
  onError({ error, path, type }) {
    console.error(
      "[tRPC ws] onError",
      error?.message,
      "path:",
      path,
      "type:",
      type,
    );
  },
});
