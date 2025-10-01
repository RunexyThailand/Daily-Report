"use client"; // 👈 ต้องประกาศว่าเป็น Client Component

import { signOut } from "next-auth/react";

export default function DashboardPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <button onClick={() => signOut({ callbackUrl: "/login" })}>Logout</button>
    </main>
  );
}
