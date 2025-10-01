"use client";
import { trpc } from "@/trpc/client";
import { useState } from "react";

export default function Home() {
  // const user = trpc.me.useQuery();
  // const utils = trpc.useUtils();
  const [title, setTitle] = useState("");




  return (
    <main style={{ padding: 24 }}>
      <h1>tRPC + NextAuth (Credentials) + Prisma</h1>
      <div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title" />
        {/* <button onClick={() => create.mutate({ title })}>Create</button> */}
      </div>
      {/* {user?.data?.user?.name} */}
    </main>
  );
}
