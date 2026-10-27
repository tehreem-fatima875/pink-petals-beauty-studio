"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Pink petals page error:", error);
  }, [error]);

  return (
    <main className="not-found" id="main-content">
      <span className="eyebrow">A SMALL PAUSE</span>
      <h1>We couldn&apos;t load this page.</h1>
      <p className="body-copy">Your details are safe. Please try again in a moment.</p>
      <button className="button button-primary" type="button" onClick={reset}>Try again</button>
    </main>
  );
}
