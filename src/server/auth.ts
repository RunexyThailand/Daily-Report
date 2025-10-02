import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// --- ถ้าใช้ Prisma + bcrypt ให้ปลดคอมเมนต์ด้านล่าง ---
import { prisma } from "@/server/db";
// import bcrypt from "bcryptjs";

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
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });

        console.log(user);

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

        // ✅ ตัวอย่างจริงกับฐานข้อมูล
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
