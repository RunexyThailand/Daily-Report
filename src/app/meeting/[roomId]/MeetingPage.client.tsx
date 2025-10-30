"use client";

import MeetingProviders from "./_providers";
import * as React from "react";
import { trpc } from "@/trpc/client";
import { getIceServers } from "@/lib/rtc/ice";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// icons
import { Video, Mic, Monitor, MonitorX } from "lucide-react";

export default function MeetingPage({ roomId }: { roomId: string }) {
  return (
    <MeetingProviders>
      <Meeting roomId={roomId} />
    </MeetingProviders>
  );
}

function Meeting({ roomId }: { roomId: string }) {
  // ---------- userId: สร้างหลัง mount เพื่อกัน Hydration mismatch ----------
  const [userId, setUserId] = React.useState<string>("");
  React.useEffect(() => {
    let id = sessionStorage.getItem("userId");
    if (!id) {
      id = crypto.randomUUID().slice(0, 8);
      sessionStorage.setItem("userId", id);
    }
    setUserId(id);
  }, []);

  // ---------- Refs & States ----------
  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null); // local cam+mic
  const screenStreamRef = React.useRef<MediaStream | null>(null); // for screen-share
  const pcMap = React.useRef<Map<string, RTCPeerConnection>>(new Map());

  const [peers, setPeers] = React.useState<string[]>([]);
  const [isScreenSharing, setIsScreenSharing] = React.useState(false);

  type ChatMsg = {
    id: string;
    type: "chat" | "stt-text";
    from: string;
    text: string;
    ts: number;
  };
  const [messages, setMessages] = React.useState<ChatMsg[]>([]);
  const [chatText, setChatText] = React.useState("");

  type MediaDevice = { deviceId: string; label: string };
  const [cams, setCams] = React.useState<MediaDevice[]>([]);
  const [mics, setMics] = React.useState<MediaDevice[]>([]);
  const [speakers, setSpeakers] = React.useState<MediaDevice[]>([]);
  const [camId, setCamId] = React.useState<string | null>(null);
  const [micId, setMicId] = React.useState<string | null>(null);
  const [speakerId, setSpeakerId] = React.useState<string | null>(null);

  type Caption = { text: string; ts: number; interim?: boolean };
  const [captions, setCaptions] = React.useState<Record<string, Caption>>({});
  const [showCaptions, setShowCaptions] = React.useState(true);
  const [captionFont, setCaptionFont] = React.useState<"sm" | "md" | "lg">(
    "md",
  );

  function setCaptionFor(user: string, text: string, interim = false) {
    setCaptions((prev) => ({
      ...prev,
      [user]: { text, ts: Date.now(), interim },
    }));
  }

  // ลบ captions ที่เกิน 6 วิ
  React.useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      setCaptions((prev) => {
        const next = { ...prev };
        for (const [uid, cap] of Object.entries(next)) {
          if (now - cap.ts > 6000) delete next[uid];
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // ---------- tRPC hooks ----------
  const joinRoom = trpc.meeting.joinRoom.useMutation();
  const signal = trpc.meeting.signal.useMutation();
  const sendChatMut = trpc.meeting.sendChat.useMutation();
  const sendSttMut = trpc.meeting.sendSttText.useMutation();
  const sendControlMut = trpc.meeting.sendControl.useMutation();

  // ---------- Subscription: รอจนมี userId ก่อน ----------
  trpc.meeting.roomEvents.useSubscription(
    { roomId, userId },
    {
      enabled: !!userId,
      onData: async (evt) => {
        if (evt.type === "peer-joined") {
          setPeers((p) => Array.from(new Set([...p, evt.userId])));
          await createAndSendOffer(evt.userId);
        }
        if (evt.type === "peer-left") {
          teardownPeer(evt.userId);
          setPeers((p) => p.filter((id) => id !== evt.userId));
        }

        if (evt.type === "offer" && evt.to === userId) {
          await ensurePeer(evt.from);
          const pc = pcMap.current.get(evt.from)!;
          await pc.setRemoteDescription(new RTCSessionDescription(evt.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await signal.mutateAsync({
            roomId,
            event: { type: "answer", from: userId, to: evt.from, sdp: answer },
          });
        }
        if (evt.type === "answer" && evt.to === userId) {
          const pc = pcMap.current.get(evt.from);
          if (pc)
            await pc.setRemoteDescription(new RTCSessionDescription(evt.sdp));
        }
        if (evt.type === "ice" && evt.to === userId) {
          const pc = pcMap.current.get(evt.from);
          if (pc) await pc.addIceCandidate(evt.candidate);
        }

        if (evt.type === "chat") {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              type: "chat",
              from: evt.from,
              text: evt.text,
              ts: evt.ts,
            },
          ]);
        }

        if (evt.type === "stt-text") {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              type: "stt-text",
              from: evt.from,
              text: evt.text,
              ts: evt.ts,
            },
          ]);
          setCaptionFor(evt.from, evt.text, false);
        }

        if (evt.type === "control") {
          if (evt.target && evt.target !== userId) return;
          const a = streamRef.current?.getAudioTracks()[0];
          if (!a) return;
          if (evt.action === "mute") a.enabled = false;
          if (evt.action === "unmute") a.enabled = true;
        }
      },
      onError: (err) => console.error("[roomEvents error]", err),
    },
  );

  // ---------- Lifecycle: เริ่มเมื่อ userId พร้อม ----------
  React.useEffect(() => {
    if (!userId) return;
    (async () => {
      await initMedia();

      const res = await joinRoom.mutateAsync({ roomId, userId });
      setPeers(res.peers);

      for (const pid of res.peers) await createAndSendOffer(pid);
    })();

    return () => {
      for (const [, pc] of pcMap.current) pc.close();
      pcMap.current.clear();
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ---------- Media & Peer Helpers ----------
  async function initMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play().catch(() => {});
      }
      await refreshDevices();
    } catch (err) {
      console.error("getUserMedia error:", err);
      alert("ไม่สามารถเข้าถึงกล้อง/ไมค์ได้ กรุณาตรวจสิทธิ์เบราว์เซอร์");
      throw err;
    }
  }

  async function ensurePeer(peerId: string) {
    if (pcMap.current.has(peerId)) return;

    const pc = new RTCPeerConnection({ iceServers: getIceServers() });

    // add local tracks
    streamRef.current
      ?.getTracks()
      .forEach((t) => pc.addTrack(t, streamRef.current!));

    pc.onicecandidate = async (e) => {
      if (e.candidate) {
        await signal.mutateAsync({
          roomId,
          event: {
            type: "ice",
            from: userId,
            to: peerId,
            candidate: e.candidate,
          },
        });
      }
    };

    pc.onconnectionstatechange = () => {
      const st = pc.connectionState;
      if (st === "failed" || st === "disconnected") {
        console.warn(`Peer ${peerId} state:`, st);
      }
    };

    pc.ontrack = (e) => {
      const el = document.getElementById(
        `peer-${peerId}`,
      ) as HTMLVideoElement | null;
      if (el) {
        el.srcObject = e.streams[0];
        el.play().catch(() => {});
      }
    };

    pcMap.current.set(peerId, pc);
  }

  async function createAndSendOffer(peerId: string) {
    await ensurePeer(peerId);
    const pc = pcMap.current.get(peerId)!;
    const offer = await pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await pc.setLocalDescription(offer);
    await signal.mutateAsync({
      roomId,
      event: { type: "offer", from: userId, to: peerId, sdp: offer },
    });
  }

  function teardownPeer(pid: string) {
    const pc = pcMap.current.get(pid);
    if (pc) pc.close();
    pcMap.current.delete(pid);
  }

  function findVideoSender(pc: RTCPeerConnection) {
    return pc.getSenders().find((s) => s.track && s.track.kind === "video");
  }
  function findAudioSender(pc: RTCPeerConnection) {
    return pc.getSenders().find((s) => s.track && s.track.kind === "audio");
  }

  // ---------- Device helpers ----------
  async function refreshDevices() {
    const list = await navigator.mediaDevices.enumerateDevices();
    setCams(
      list
        .filter((d) => d.kind === "videoinput")
        .map((d) => ({ deviceId: d.deviceId, label: d.label || "Camera" })),
    );
    setMics(
      list
        .filter((d) => d.kind === "audioinput")
        .map((d) => ({ deviceId: d.deviceId, label: d.label || "Microphone" })),
    );
    setSpeakers(
      list
        .filter((d) => d.kind === "audiooutput")
        .map((d) => ({ deviceId: d.deviceId, label: d.label || "Speaker" })),
    );
  }

  async function switchCamera(deviceId: string) {
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } },
      audio: false,
    });
    const newTrack = newStream.getVideoTracks()[0];
    const oldTrack = streamRef.current?.getVideoTracks()[0];

    for (const [, pc] of pcMap.current) {
      const sender = findVideoSender(pc);
      if (sender) await sender.replaceTrack(newTrack);
    }

    if (!streamRef.current) {
      streamRef.current = new MediaStream([newTrack]);
    } else {
      if (oldTrack) oldTrack.stop();
      if (oldTrack) streamRef.current.removeTrack(oldTrack);
      streamRef.current.addTrack(newTrack);
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = streamRef.current!;
      await localVideoRef.current.play().catch(() => {});
    }
    setCamId(deviceId);
  }

  async function switchMic(deviceId: string) {
    const newStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: deviceId } },
      video: false,
    });
    const newTrack = newStream.getAudioTracks()[0];
    const oldTrack = streamRef.current?.getAudioTracks()[0];

    for (const [, pc] of pcMap.current) {
      const sender = findAudioSender(pc);
      if (sender) await sender.replaceTrack(newTrack);
    }

    if (!streamRef.current) {
      streamRef.current = new MediaStream([newTrack]);
    } else {
      if (oldTrack) oldTrack.stop();
      if (oldTrack) streamRef.current.removeTrack(oldTrack);
      streamRef.current.addTrack(newTrack);
    }
    setMicId(deviceId);
  }

  async function setOutputForPeerElements(deviceId: string) {
    const els = Array.from(document.querySelectorAll("video"));
    for (const el of els) {
      const mediaEl = el as HTMLMediaElement & {
        setSinkId?: (id: string) => Promise<void>;
      };
      if (typeof mediaEl.setSinkId === "function") {
        try {
          await mediaEl.setSinkId(deviceId);
        } catch {
          // ignore
        }
      }
    }
    setSpeakerId(deviceId);
  }

  // ---------- Screen Share ----------
  async function startScreenShare() {
    if (isScreenSharing) return;
    const screen = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 },
      audio: false,
    });
    screenStreamRef.current = screen;
    const screenTrack = screen.getVideoTracks()[0];
    screenTrack.onended = () => stopScreenShare();

    for (const [, pc] of pcMap.current) {
      const sender = findVideoSender(pc);
      if (sender) await sender.replaceTrack(screenTrack);
      else pc.addTrack(screenTrack, screen);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = screen;
      await localVideoRef.current.play().catch(() => {});
    }
    setIsScreenSharing(true);
  }

  async function shareScreenPicker(withSystemAudio: boolean) {
    if (isScreenSharing) return;
    const screen = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 },
      audio: withSystemAudio ? ({} as any) : false,
    });
    screenStreamRef.current = screen;
    const screenTrack = screen.getVideoTracks()[0];
    screenTrack.onended = () => stopScreenShare();

    for (const [, pc] of pcMap.current) {
      const sender = findVideoSender(pc);
      if (sender) await sender.replaceTrack(screenTrack);
      else pc.addTrack(screenTrack, screen);
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = screen;
      await localVideoRef.current.play().catch(() => {});
    }
    setIsScreenSharing(true);
  }

  async function stopScreenShare() {
    if (!isScreenSharing) return;
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;

    const camTrack = streamRef.current?.getVideoTracks()[0];
    if (camTrack) {
      for (const [, pc] of pcMap.current) {
        const sender = findVideoSender(pc);
        if (sender) await sender.replaceTrack(camTrack);
      }
    }
    if (localVideoRef.current && streamRef.current) {
      localVideoRef.current.srcObject = streamRef.current;
      await localVideoRef.current.play().catch(() => {});
    }
    setIsScreenSharing(false);
  }

  // ---------- Chat & Control ----------
  const sendChat = async () => {
    const text = chatText.trim();
    if (!text || !userId) return;
    await sendChatMut.mutateAsync({ roomId, from: userId, text });
    setChatText("");
  };

  const sendStt = async (text: string) => {
    const t = text.trim();
    if (!t || !userId) return;
    setCaptionFor(userId, t, false);
    await sendSttMut.mutateAsync({ roomId, from: userId, text: t });
  };

  async function muteAll() {
    if (!userId) return;
    await sendControlMut.mutateAsync({ roomId, from: userId, action: "mute" });
  }
  async function unmuteAll() {
    if (!userId) return;
    await sendControlMut.mutateAsync({
      roomId,
      from: userId,
      action: "unmute",
    });
  }
  async function mutePeer(pid: string) {
    if (!userId) return;
    await sendControlMut.mutateAsync({
      roomId,
      from: userId,
      action: "mute",
      target: pid,
    });
  }
  async function unmutePeer(pid: string) {
    if (!userId) return;
    await sendControlMut.mutateAsync({
      roomId,
      from: userId,
      action: "unmute",
      target: pid,
    });
  }

  // ---------- UI helpers ----------
  function CaptionBubble({
    text,
    interim,
    font,
  }: {
    text: string;
    interim?: boolean;
    font: "sm" | "md" | "lg";
  }) {
    const size =
      font === "lg" ? "text-lg" : font === "md" ? "text-base" : "text-sm";
    return (
      <div
        className={`max-w-[85%] mx-auto ${size} text-white bg-black/60 backdrop-blur px-3 py-1 rounded-xl
        ${interim ? "opacity-80 italic" : "opacity-100"} shadow`}
      >
        {text}
      </div>
    );
  }

  // ---------- UI ----------
  return (
    <div className="p-4 space-y-4">
      <div className="text-xl font-semibold">
        Room: {roomId} — You: {userId || "…"}
      </div>

      {/* Device selectors */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="min-w-[220px]">
          <Label>Camera</Label>
          <Select value={camId ?? ""} onValueChange={(v) => switchCamera(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select camera" />
            </SelectTrigger>
            <SelectContent>
              {cams.map((c) => (
                <SelectItem key={c.deviceId} value={c.deviceId}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-[220px]">
          <Label>Microphone</Label>
          <Select value={micId ?? ""} onValueChange={(v) => switchMic(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select microphone" />
            </SelectTrigger>
            <SelectContent>
              {mics.map((m) => (
                <SelectItem key={m.deviceId} value={m.deviceId}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {speakers.length > 0 && (
          <div className="min-w-[220px]">
            <Label>Speaker (output)</Label>
            <Select
              value={speakerId ?? ""}
              onValueChange={(v) => setOutputForPeerElements(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select speaker" />
              </SelectTrigger>
              <SelectContent>
                {speakers.map((s) => (
                  <SelectItem key={s.deviceId} value={s.deviceId}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Main layout: videos + chat */}
      <div className="grid grid-cols-3 gap-4">
        {/* Video zone (2/3) */}
        <div className="col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* local video + controls + captions */}
            <div className="space-y-2">
              <div className="relative">
                <video
                  ref={localVideoRef}
                  muted
                  playsInline
                  className="w-full rounded-xl bg-black"
                />
                {showCaptions && captions[userId]?.text && (
                  <div className="absolute left-0 right-0 bottom-2 flex justify-center px-2 pointer-events-none">
                    <CaptionBubble
                      text={captions[userId].text}
                      interim={captions[userId].interim}
                      font={captionFont}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    streamRef.current
                      ?.getVideoTracks()
                      .forEach((t) => (t.enabled = !t.enabled))
                  }
                >
                  <Video className="mr-2 h-4 w-4" /> Toggle Video
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    streamRef.current
                      ?.getAudioTracks()
                      .forEach((t) => (t.enabled = !t.enabled))
                  }
                >
                  <Mic className="mr-2 h-4 w-4" /> Toggle Mic
                </Button>

                {isScreenSharing ? (
                  <Button variant="destructive" onClick={stopScreenShare}>
                    <MonitorX className="mr-2 h-4 w-4" /> Stop Share
                  </Button>
                ) : (
                  <>
                    <Button variant="default" onClick={startScreenShare}>
                      <Monitor className="mr-2 h-4 w-4" /> Share Screen
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => shareScreenPicker(true)}
                    >
                      Share Screen + Audio
                    </Button>
                  </>
                )}
              </div>

              {/* Captions controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showCaptions}
                    onCheckedChange={setShowCaptions}
                  />
                  <span>Show captions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Caption size
                  </span>
                  <Button
                    size="sm"
                    variant={captionFont === "sm" ? "default" : "outline"}
                    onClick={() => setCaptionFont("sm")}
                  >
                    A
                  </Button>
                  <Button
                    size="sm"
                    variant={captionFont === "md" ? "default" : "outline"}
                    onClick={() => setCaptionFont("md")}
                  >
                    A
                  </Button>
                  <Button
                    size="sm"
                    variant={captionFont === "lg" ? "default" : "outline"}
                    onClick={() => setCaptionFont("lg")}
                  >
                    A
                  </Button>
                </div>
              </div>

              {/* Mute all controls */}
              <div className="flex gap-2">
                <Button variant="secondary" onClick={muteAll}>
                  Mute all
                </Button>
                <Button variant="ghost" onClick={unmuteAll}>
                  Unmute all
                </Button>
              </div>
            </div>

            {/* remote peers + captions */}
            <div className="space-y-4">
              {peers.map((pid) => (
                <div key={pid} className="space-y-2">
                  <div className="relative">
                    <video
                      id={`peer-${pid}`}
                      playsInline
                      className="w-full rounded-xl bg-black"
                    />
                    {showCaptions && captions[pid]?.text && (
                      <div className="absolute left-0 right-0 bottom-2 flex justify-center px-2 pointer-events-none">
                        <CaptionBubble
                          text={captions[pid].text}
                          interim={captions[pid].interim}
                          font={captionFont}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => mutePeer(pid)}
                    >
                      Mute {pid}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => unmutePeer(pid)}
                    >
                      Unmute {pid}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat zone (1/3) */}
        <div className="col-span-1 flex flex-col border rounded-xl">
          <div className="px-3 py-2 font-medium border-b">Chat</div>
          <ScrollArea className="flex-1 h-64 p-3">
            <div className="space-y-2">
              {messages.map((m) => (
                <div key={m.id} className="text-sm">
                  <span className="font-semibold">{m.from}</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded ${
                      m.type === "stt-text" ? "bg-amber-100" : "bg-slate-100"
                    }`}
                  >
                    {m.text}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-3 flex gap-2 border-t">
            <Input
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="พิมพ์ข้อความ…"
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
            />
            <Button onClick={sendChat}>Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
