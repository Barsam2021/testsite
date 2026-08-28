import type { Settings } from "@/lib/auction";
import { formatCents } from "@/lib/money";

export function HowItWorks({ settings }: { settings: Settings }) {
  const steps = [
    {
      title: "Pick your spot and size",
      body: "Ten zones in three sticker sizes, priced by size and visibility. The closer to the apple, the more it costs.",
    },
    {
      title: "Place your bid",
      body: `Bidding takes a ${settings.deposit_bps / 100}% deposit (minimum ${formatCents(
        settings.min_deposit_cents,
        settings.currency,
      )}), paid by card. Get outbid and it comes back in full, automatically. Win and it counts toward the price.`,
    },
    {
      title: "Your sticker rides along",
      body: "I print your logo as a die-cut vinyl sticker, and everywhere the machine goes, your brand is visible. You also get a spot on this page with a link to your site.",
    },
  ];

  return (
    <section id="how" className="mx-auto max-w-4xl scroll-mt-20 px-6 py-16 md:py-24">
      <h2 className="text-3xl font-semibold tracking-[-0.015em] md:text-4xl">How it works</h2>
      <ol className="mt-10 space-y-10">
        {steps.map((step, i) => (
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
