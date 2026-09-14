import { Header } from "./header";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { EscrowBand } from "./escrow-band";
import { LiveCampaigns } from "./live-campaigns";
import { CreatorSection } from "./creator-section";
import { CtaBand } from "./cta-band";
import { FooterNewsletter } from "@/components/ui/footer-newsletter";
import { getLandingData } from "@/server/queries/public";

export interface LandingPageProps {
  /** The platform's escrow position band ("Where the money sits"). */
  showEscrowBand?: boolean;
  /** Which CTA leads in the hero and closing band — donors or creators. */
  ctaOrder?: "donor-first" | "creator-first";
}

export async function LandingPage({
  showEscrowBand = true,
  ctaOrder = "donor-first",
}: LandingPageProps) {
  const { stats, escrowFigures, live } = await getLandingData();
  return (
    <div style={{ background: "hsl(var(--canvas))" }}>
      <Header variant="overlay" />
      <Hero ctaOrder={ctaOrder} stats={stats} />
      <HowItWorks />
      {showEscrowBand && <EscrowBand figures={escrowFigures} />}
      <LiveCampaigns campaigns={live} totalLive={stats.liveCount} />
      <CreatorSection />
      <CtaBand />
      <FooterNewsletter />
    </div>
  );
}
