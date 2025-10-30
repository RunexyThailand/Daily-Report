// src/server/routers/meeting.ts
import { router, publicProcedure } from "@/server/trpc";
import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { EventEmitter } from "events";

const bus = new EventEmitter();
bus.setMaxListeners(1000);

/** ========= Event types (ต้องตรงกับที่ Client ใช้) ========= */
const Offer = z.object({
  type: z.literal("offer"),
  from: z.string(),
  to: z.string(),
  sdp: z.any(), // RTCSessionDescriptionInit
});
const Answer = z.object({
  type: z.literal("answer"),
  from: z.string(),
  to: z.string(),
  sdp: z.any(),
});
const Ice = z.object({
  type: z.literal("ice"),
  from: z.string(),
  to: z.string(),
  candidate: z.any(), // RTCIceCandidateInit
});
const PeerJoined = z.object({
  type: z.literal("peer-joined"),
  userId: z.string(),
});
const PeerLeft = z.object({
  type: z.literal("peer-left"),
  userId: z.string(),
});
const Chat = z.object({
  type: z.literal("chat"),
  from: z.string(),
  text: z.string(),
  ts: z.number(),
});
const SttText = z.object({
  type: z.literal("stt-text"),
  from: z.string(),
  text: z.string(),
  ts: z.number(),
});
const Control = z.object({
  type: z.literal("control"),
  from: z.string(),
  action: z.enum(["mute", "unmute"]),
  target: z.string().optional(), // ถ้าไม่ส่ง = broadcast
});

const AnyRoomEvent = z.discriminatedUnion("type", [
  Offer,
  Answer,
  Ice,
  PeerJoined,
  PeerLeft,
  Chat,
  SttText,
  Control,
]);

/** ========= ห้องแบบ in-memory ========= */
const roomPeers = new Map<string, Set<string>>(); // roomId -> userIds

function getPeers(roomId: string) {
  let set = roomPeers.get(roomId);
  if (!set) {
    set = new Set();
    roomPeers.set(roomId, set);
  }
  return set;
}

export const meetingRouter = router({
  // client เรียกตอน mount เพื่อเข้าห้อง
  joinRoom: publicProcedure
    .input(z.object({ roomId: z.string(), userId: z.string() }))
    .mutation(({ input }) => {
      const peers = getPeers(input.roomId);
      // รายชื่อที่มีอยู่ก่อนหน้า (ยกเว้นตัวเอง)
      const others = Array.from(peers).filter((id) => id !== input.userId);
      peers.add(input.userId);

      // แจ้งคนอื่นในห้องว่ามีคนเข้า
      bus.emit("room:event", {
        roomId: input.roomId,
        payload: { type: "peer-joined", userId: input.userId } as z.infer<
          typeof PeerJoined
        >,
      });

      return { peers: others };
    }),

  // สัญญาณ WebRTC (offer/answer/ice)
  signal: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
        event: z.discriminatedUnion("type", [Offer, Answer, Ice]),
      }),
    )
    .mutation(({ input }) => {
      bus.emit("room:event", { roomId: input.roomId, payload: input.event });
      return { ok: true };
    }),

  // แชท
  sendChat: publicProcedure
    .input(z.object({ roomId: z.string(), from: z.string(), text: z.string() }))
    .mutation(({ input }) => {
      const evt: z.infer<typeof Chat> = {
        type: "chat",
        from: input.from,
        text: input.text,
        ts: Date.now(),
      };
      bus.emit("room:event", { roomId: input.roomId, payload: evt });
      return { ok: true };
    }),

  // STT final text
  sendSttText: publicProcedure
    .input(z.object({ roomId: z.string(), from: z.string(), text: z.string() }))
    .mutation(({ input }) => {
      const evt: z.infer<typeof SttText> = {
        type: "stt-text",
        from: input.from,
        text: input.text,
        ts: Date.now(),
      };
      bus.emit("room:event", { roomId: input.roomId, payload: evt });
      return { ok: true };
    }),

  // ควบคุมไมค์ (broadcast หรือเจาะจง target)
  sendControl: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
        from: z.string(),
        action: z.enum(["mute", "unmute"]),
        target: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const evt: z.infer<typeof Control> = {
        type: "control",
        from: input.from,
        action: input.action,
        target: input.target,
      };
      bus.emit("room:event", { roomId: input.roomId, payload: evt });
      return { ok: true };
    }),

  // สตรีมอีเวนต์ของห้อง
  roomEvents: publicProcedure
    .input(z.object({ roomId: z.string(), userId: z.string() }))
    .subscription(({ input }) => {
      return observable<z.infer<typeof AnyRoomEvent>>((emit) => {
        const onEvent = (data: {
          roomId: string;
          payload: z.infer<typeof AnyRoomEvent>;
        }) => {
          if (data.roomId === input.roomId) {
            emit.next(data.payload);
          }
        };
        bus.on("room:event", onEvent);

        return () => {
          bus.off("room:event", onEvent);
        };
      });
    }),
});
