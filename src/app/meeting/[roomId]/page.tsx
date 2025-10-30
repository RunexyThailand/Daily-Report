// Server Component (ไม่มี "use client")
import MeetingPage from "./MeetingPage.client";
import { randomUUID } from "crypto";
import dynamic from "next/dynamic";

type Params = { roomId: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { roomId } = await params;

  // ✅ สร้างบน server เพื่อให้ SSR/Client ตรงกัน
  const userId = randomUUID().slice(0, 8);

  return <MeetingPage roomId={roomId} />;
}
