import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectMongo } from "@/lib/db";
import { UserModel } from "@/lib/models";
import { checkRateLimit } from "@/lib/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = z.object({
          email: z.string().email().max(254),
          password: z.string().min(1).max(200),
        }).safeParse(credentials);
        if (!parsed.success || !process.env.MONGODB_URI) return null;
        const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
          || request.headers.get("x-real-ip")
          || "unknown";
        const attempt = checkRateLimit(`admin-login:${address}:${parsed.data.email.toLowerCase()}`, 6, 15 * 60 * 1000);
        if (!attempt.allowed) return null;
        await connectMongo();
        const user = await UserModel.findOne({
          email: parsed.data.email.toLowerCase(),
          active: true,
        }).select("+passwordHash");
        if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as "admin" | "staff",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user && "role" in user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role === "admin" || token.role === "staff" ? token.role : "staff";
      }
      return session;
    },
  },
});
