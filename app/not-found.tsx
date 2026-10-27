import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found" id="main-content">
      <span className="eyebrow">A LITTLE OFF THE PATH</span>
      <h1>This page wandered off.</h1>
      <p className="body-copy">Let&apos;s find you something lovely instead.</p>
      <Link className="button button-primary" href="/">Back to Pink petals <span aria-hidden="true">↗</span></Link>
    </main>
  );
}
