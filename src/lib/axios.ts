import axios, { AxiosInstance, AxiosError } from "axios";
import qs from "qs";

const isServer = typeof window === "undefined";

function getBaseURL() {
  if (isServer)
    return (
      process.env.API_BASE_URL_INTERNAL || process.env.NEXT_PUBLIC_API_BASE_URL!
    );
  return process.env.NEXT_PUBLIC_API_BASE_URL!;
}

export function createAxios(
  baseHeaders?: Record<string, string>,
): AxiosInstance {
  const instance = axios.create({
    baseURL: getBaseURL(),
    headers: {
      "Content-Type": "application/json",
      ...baseHeaders,
    },
    timeout: 30_000,
    withCredentials: true,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat", skipNulls: true }),
  });

  instance.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      const status = error.response?.status ?? 0;
      const data = error.response?.data as unknown;
      let message =
        error.message && typeof error.message === "string"
          ? error.message
          : "Network error";

      if (typeof data === "string") {
        message = data;
      } else if (data && typeof data === "object") {
        const maybeMessage = (data as Record<string, unknown>)["message"];
        if (typeof maybeMessage === "string") message = maybeMessage;
      }
      return Promise.reject({ status, message, raw: error });
    },
  );

  return instance;
}
