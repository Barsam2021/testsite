export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-4xl px-6 py-14">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <span
            aria-hidden="true"
            className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border border-hairline bg-surface text-[24px]"
          >
            👋
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold">Hey, I&rsquo;m Vincent 👋</p>
            <p className="mt-2 max-w-[58ch] text-[14px] leading-relaxed text-ink-2">
              Solo founder, indie hacking for a year and a half. I build in public, ship SaaS, mobile
              apps, and even do some game dev. I&rsquo;m funding my first MacBook by renting out its
              lid. Questions, or want a spot?{" "}
              <a
                href="https://x.com/vynsedev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue hover:underline"
              >
                Find me on X
              </a>{" "}
              or{" "}
              <a href="mailto:contact@vynse.dev" className="text-blue hover:underline">
                email me
              </a>
              .
            </p>
            <p className="mt-3 max-w-[58ch] text-[14px] leading-relaxed text-ink-2">
              Want to do this with your own laptop?{" "}
              <a href="#waitlist" className="text-blue hover:underline">
                Join the waitlist
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-hairline pt-6 text-[13px] leading-relaxed text-ink-2 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-2/70">
            <a href="/privacy" className="transition-colors hover:text-ink-2">Privacy</a>
            <a href="/terms" className="transition-colors hover:text-ink-2">Terms</a>
          </nav>
        </div>

        <p className="mt-6 text-[12px] leading-relaxed text-ink-2">
          Brand My Mac is not affiliated with, endorsed by, or sponsored by Apple&nbsp;Inc.
          MacBook&nbsp;Pro and Mac are trademarks of Apple&nbsp;Inc.
        </p>
      </div>
    </footer>
  );
}
