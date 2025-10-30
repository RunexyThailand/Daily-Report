export type RoomEvent =
  | { type: "peer-joined"; userId: string }
  | { type: "peer-left"; userId: string }
  | { type: "offer"; from: string; to: string; sdp: any }
  | { type: "answer"; from: string; to: string; sdp: any }
  | { type: "ice"; from: string; to: string; candidate: any }
  | { type: "chat"; roomId: string; from: string; text: string; ts: number }
  | { type: "stt-text"; roomId: string; from: string; text: string; ts: number }
  | {
      type: "control";
      roomId: string;
      from: string;
      action: "mute" | "unmute";
      target?: string;
      ts: number;
    };

type Client = { userId: string; emit: (evt: RoomEvent) => void };

class RoomHub {
  private rooms = new Map<string, Map<string, Client>>();

  join(roomId: string, client: Client) {
    const room = this.rooms.get(roomId) ?? new Map<string, Client>();
    room.set(client.userId, client);
    this.rooms.set(roomId, room);
    for (const [uid, c] of room) {
      if (uid !== client.userId)
        c.emit({ type: "peer-joined", userId: client.userId });
    }
  }

  leave(roomId: string, userId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.delete(userId);
    for (const [, c] of room) c.emit({ type: "peer-left", userId });
    if (room.size === 0) this.rooms.delete(roomId);
  }

  send(roomId: string, evt: RoomEvent) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    if ("to" in evt) {
      const target = room.get(evt.to);
      if (target) target.emit(evt);
    } else {
      for (const [, c] of room) c.emit(evt);
    }
  }

  listPeers(roomId: string, excludeUserId: string) {
    return Array.from(this.rooms.get(roomId)?.keys() ?? []).filter(
      (id) => id !== excludeUserId,
    );
  }
}

export const roomHub = new RoomHub();
