import { appRouter } from "@/server/routers";
import { createContext } from "@/server/trpc";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// ถ้าใช้ Prisma/Node-only libs แนะนำให้รันใน Node.js runtime
export const runtime = "nodejs";
// กันแคชบน edge/build บางกรณี (ทางเลือก)
// export const dynamic = "force-dynamic";

const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,
        createContext,
        onError({ error, path }) {
            console.error("tRPC error on", path, error);
        },
    });

export { handler as GET, handler as POST };

// (ตัวเลือก) รองรับ CORS preflight กรณีเรียกข้ามโดเมนตอน dev
export function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
    });
}
