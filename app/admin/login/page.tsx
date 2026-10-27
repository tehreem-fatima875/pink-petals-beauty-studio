import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminLoginForm from "@/components/admin-login-form";

export const metadata: Metadata = { title: "Staff sign in", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (!process.env.MONGODB_URI || !process.env.AUTH_SECRET) {
    return (
      <main className="admin-shell" id="main-content">
        <section className="admin-login">
          <span className="eyebrow">PINK PETALS · STAFF</span>
          <h1 className="display-title">Staff sign-in<br /><em>is not configured.</em></h1>
          <p className="body-copy">Set MONGODB_URI and AUTH_SECRET, then create the first administrator using the documented bootstrap command.</p>
        </section>
      </main>
    );
  }
  const session = await auth();
  if (session?.user) redirect("/admin");
  return (
    <main className="admin-shell" id="main-content">
      <section className="admin-login">
        <span className="eyebrow">PINK PETALS · STAFF</span>
        <h1 className="display-title">Welcome<br /><em>back.</em></h1>
        <p className="body-copy">Sign in to manage salon appointments.</p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
