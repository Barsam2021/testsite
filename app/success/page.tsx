import { Wordmark } from "@/components/Wordmark";

export const dynamic = "force-dynamic";

export default function Success() {
  return (
    <>
      <nav className="border-b border-hairline/70">
        <div className="mx-auto flex h-13 max-w-6xl items-center px-6 py-3">
          <a href="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-[-0.01em]">
            <Wordmark className="h-7 w-auto" />
            Brand My Mac
          </a>
        </div>
      </nav>
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
          Deposit received.
        </h1>
        <p className="mx-auto mt-4 max-w-[52ch] leading-relaxed text-ink-2">
          Your bid is in. I check every sponsor by hand before anything goes on the lid — until then
          it shows as &ldquo;under review&rdquo; on the spot you bid on. You&rsquo;ll hear from me
          either way, and if it doesn&rsquo;t work out your deposit comes back in full.
        </p>
        <a
          href="/"
          className="mt-8 inline-block rounded-full bg-blue px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-blue-hover"
        >
          Back to the auction
        </a>
      </main>
    </>
  );
}
