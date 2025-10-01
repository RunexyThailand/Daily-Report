// src/server/auth.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// --- ถ้าใช้ Prisma + bcrypt ให้ปลดคอมเมนต์ด้านล่าง ---
// import { prisma } from "@/server/db";
// import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,

    // หน้า sign-in ที่จะ redirect ไปเมื่อยังไม่ล็อกอิน
    pages: {
        signIn: "/login",
    },

    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // ✅ ตัวอย่างง่าย (ฮาร์ดโค้ด)
                if (
                    credentials?.email === "demo@example.com" &&
                    credentials?.password === "demo1234"
                ) {
                    return {
                        id: "1",
                        name: "Demo User",
                        email: "demo@example.com",
                    };
                }

                // ✅ ตัวอย่างจริงกับฐานข้อมูล (ปลดคอมเมนต์เพื่อใช้)
                /*
                if (!credentials?.email || !credentials?.password) return null;
        
                const user = await prisma.user.findUnique({
                  where: { email: credentials.email },
                });
                if (!user || !user.passwordHash) return null;
        
                const ok = await bcrypt.compare(credentials.password, user.passwordHash);
                if (!ok) return null;
        
                return { id: user.id, name: user.name ?? user.email, email: user.email };
                */

                return null;
            },
        }),
    ],

    // --- callbacks: ฝังข้อมูลลง JWT/Session ให้พร้อมใช้ใน tRPC ---
    callbacks: {
        async jwt({ token, user }) {
            // ตอนล็อกอินครั้งแรก จะมี user → เก็บ id ลง token
            if (user?.id) token.id = user.id as string;
            return token;
        },
        async session({ session, token }) {
            // ทำให้ session.user.id พร้อมใช้งาน
            if (session.user && token?.id) {
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
};
