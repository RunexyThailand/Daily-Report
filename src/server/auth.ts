import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// --- ถ้าใช้ Prisma + bcrypt ให้ปลดคอมเมนต์ด้านล่าง ---
import { prisma } from "@/server/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  // หน้า sign-in ที่จะ redirect ไปเมื่อยังไม่ล็อกอิน
  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email, is_active: true },
        });
        if (!user || !user.password) return null;

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email,
        };
      },
    }),
  ],

  callbacks: {
    async redirect({ url, baseUrl }) {
      // บังคับให้กลับไป /protected/report หลัง login สำเร็จ
      // แต่ถ้ามี callbackUrl ที่เป็น internal ให้เคารพด้วย
      try {
        const u = new URL(url);
        const b = new URL(baseUrl);
        const isInternal = u.origin === b.origin;
        if (isInternal) {
          // ถ้า callbackUrl เป็น internal และตั้งมาแล้ว ก็ใช้เลย
          if (u.pathname && u.pathname !== "/login" && u.pathname !== "/") {
            return u.toString();
          }
        }
      } catch {}
      return `${baseUrl}/protected/report`;
    },
    async jwt({ token, user }) {
      // ตอน login ครั้งแรก user จะไม่เป็น undefined
      if (user?.id) {
        token.id = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        // เพิ่ม id ลงใน session.user
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
};

export const getAuth = () => getServerSession(authOptions);
