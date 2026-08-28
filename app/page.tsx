"use client";

import { useState } from "react";
import type { Spot } from "@/lib/spots";
import { CurrencyProvider } from "@/components/CurrencyContext";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { DarkPitch } from "@/components/DarkPitch";
import { Spots } from "@/components/Spots";
import { HowItWorks } from "@/components/HowItWorks";
import { Specs } from "@/components/Specs";
import { Faq } from "@/components/Faq";
import { Waitlist } from "@/components/Waitlist";
import { Footer } from "@/components/Footer";
import { BidDialog } from "@/components/BidDialog";

export default function Page() {
  const [bidding, setBidding] = useState<Spot | null>(null);

  return (
    <CurrencyProvider>
      <Nav />
      <main>
        <Hero onBid={setBidding} />
        <DarkPitch />
        <Spots onBid={setBidding} />
        <HowItWorks />
        <Specs />
        <Faq />
        <Waitlist />
      </main>
      <Footer />
      <BidDialog spot={bidding} onClose={() => setBidding(null)} />
    </CurrencyProvider>
  );
}
