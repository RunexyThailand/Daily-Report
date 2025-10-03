import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value || "en";
  const locale = cookieLocale;
  return {
    locale,
    messages: (await import(`../../public/locales/${locale}.json`)).default,
    timeZone: "Asia/Bangkok",
  };
});
