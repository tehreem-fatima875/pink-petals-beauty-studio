import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import AdminAppointments from "@/components/admin-appointments";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Salon dashboard", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!process.env.MONGODB_URI || !process.env.AUTH_SECRET) redirect("/admin/login");
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return (
    <main className="admin-shell" id="main-content">
      <div className="admin-bar">
        <div><span className="eyebrow">PINK PETALS · {session.user.role.toUpperCase()}</span><h1 className="display-title">Appointment<br /><em>desk.</em></h1></div>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button className="button button-outline" type="submit">Sign out</button></form>
      </div>
      <p className="body-copy">Signed in as {session.user.name || session.user.email}. Appointment records are private to salon staff.</p>
      <AdminAppointments canManage={session.user.role === "admin"} />
      <p className="admin-footnote">Revenue reporting is omitted until payment data is actually integrated.</p>
      <Link href="/" className="text-link admin-back">← Back to Pink petals</Link>
    </main>
  );
}
