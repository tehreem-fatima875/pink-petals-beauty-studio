import { auth } from "@/auth";

export async function requireStaff() {
  if (!process.env.AUTH_SECRET) return null;
  const session = await auth();
  if (!session?.user || !["admin", "staff"].includes(session.user.role)) return null;
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return null;
  return session;
}
