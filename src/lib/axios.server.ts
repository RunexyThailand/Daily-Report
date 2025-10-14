import { cookies, headers } from "next/headers";
import { createAxios } from "./axios";

export async function axiosServer() {
  const cookieStore = await cookies();
  const h = await headers();

  const access = cookieStore.get("access_token")?.value;

  const xff = h.get("x-forwarded-for") ?? undefined;
  const ua = h.get("user-agent") ?? undefined;

  const baseHeaders: Record<string, string> = {};
  if (access) baseHeaders.Authorization = `Bearer ${access}`;
  if (xff) baseHeaders["x-forwarded-for"] = xff;
  if (ua) baseHeaders["user-agent"] = ua;

  return createAxios(baseHeaders);
}
