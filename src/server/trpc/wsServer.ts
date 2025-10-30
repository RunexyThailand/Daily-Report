// src/server/trpc/wsServer.ts
import { WebSocketServer } from "ws";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { appRouter } from "@/server/routers";
import { createWSContext } from "./context.ws";

const port = Number(process.env.TRPC_WS_PORT ?? 3001);
const wss = new WebSocketServer({ port });

const handler = applyWSSHandler({
  wss,
  router: appRouter,
  createContext: createWSContext, // ⬅️ ส่งตรงได้เลย เมื่อ type identity ตรงกัน
});

wss.on("listening", () => {
  console.log(`tRPC WS listening ws://localhost:${port}`);
});
