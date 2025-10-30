// src/lib/rtc/ice.ts
export function getIceServers() {
  const urls = (process.env.NEXT_PUBLIC_ICE_URLS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const username = process.env.NEXT_PUBLIC_ICE_USERNAME;
  const credential = process.env.NEXT_PUBLIC_ICE_CREDENTIAL;

  return urls.map((u) =>
    u.startsWith("turn:") ? { urls: u, username, credential } : { urls: u },
  );
}
