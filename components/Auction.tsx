"use client";

import { useState } from "react";
import type { BoardSpot } from "@/lib/auction";
import type { PageData } from "@/lib/public-data";
import { CurrencyProvider } from "./Currency";
import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { DarkPitch } from "./DarkPitch";
import { Spots } from "./Spots";
import { HowItWorks } from "./HowItWorks";
import { Specs } from "./Specs";
import { Faq } from "./Faq";
import { Footer } from "./Footer";
import { BidDialog } from "./BidDialog";

export function Auction({ data }: { data: PageData }) {
  const [bidding, setBidding] = useState<BoardSpot | null>(null);
  const { settings } = data;

  return (
    <CurrencyProvider base={settings.currency}>
      <Nav base={settings.currency} />
      <main>
        <Hero
          settings={settings}
          spots={data.spots}
          raisedCents={data.raised_cents}
          onBid={setBidding}
        />
        <DarkPitch />
        <Spots
          settings={settings}
          spots={data.spots}
          history={data.history}
          totalBids={data.total_bids}
          taken={data.taken}
          onBid={setBidding}
        />
        <HowItWorks settings={settings} />
        <Specs settings={settings} />
        <Faq settings={settings} />
      </main>
      <Footer settings={settings} />
      <BidDialog spot={bidding} settings={settings} onClose={() => setBidding(null)} />
    </CurrencyProvider>
  );
}
