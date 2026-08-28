export function DarkPitch() {
  return (
    <section className="bg-ink py-24 text-white md:py-36">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <h2 className="text-[clamp(1.75rem,5vw,3.75rem)] font-semibold leading-[1.06] tracking-[-0.025em]">
          Everyone recognises the apple.{" "}
          <span className="text-white/55">Show your logo right next to it.</span>
        </h2>
        <div className="mt-14 flex justify-center">
          <a
            href="#spots"
            aria-label="See the live auction"
            className="rounded-full p-2 text-white/45 transition-colors hover:text-white/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" className="h-8 w-8">
              <path
                d="M6 9.75L12 15.75L18 9.75"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
