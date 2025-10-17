"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "@/trpc/client";
import { LayoutProvider } from "@/components/layout/layout-provider";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { SessionProvider } from "next-auth/react";

type ProvidersProps = {
  children: ReactNode;
  messages: AbstractIntlMessages;
  locale: string; // <-- ต้องมี และต้อง pass ไปให้ NextIntlClientProvider
};

export default function Providers({
  children,
  messages,
  locale,
}: ProvidersProps) {
  const timeZone = "Asia/Bangkok";
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {/* ✅ ใส่ locale ชัดเจน */}

        <NextIntlClientProvider
          messages={messages}
          locale={locale}
          timeZone={timeZone}
        >
          <SessionProvider>
            <LayoutProvider>{children}</LayoutProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
