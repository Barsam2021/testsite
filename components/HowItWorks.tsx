const STEPS = [
  {
    title: "Pick your spot and size",
    body: "Ten zones in three sticker sizes, priced by size and visibility.",
  },
  {
    title: "Win the bid",
    body: "The top bid at the end of the auction wins. I'll reach out to arrange payment.",
  },
  {
    title: "Your sticker rides along",
    body: "I print your logo as a quality die-cut vinyl sticker, and everywhere the MacBook goes, your brand is visible.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-4xl scroll-mt-20 px-6 py-16 md:py-24">
      <h2 className="text-3xl font-semibold tracking-[-0.015em] md:text-4xl">How it works</h2>
      <ol className="mt-10 space-y-10">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-6">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-[15px] font-semibold text-white"
            >
              {i + 1}
            </span>
            <div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="mt-1.5 max-w-[58ch] leading-relaxed text-ink-2">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
