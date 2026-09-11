import Link from "next/link";
import Image from "next/image";
import type { LandingStats } from "@/lib/view-models";
import styles from "./responsive.module.css";
import hero from "./hero.module.css";

/*
 * Photo: Unsplash (unsplash.com/photos/photo-1503387762-592deb58ef4e), stored
 * locally rather than hot-linked so the hero's LCP image is not a third-party
 * request. Swap the file to change the hero; nothing else reads it.
 */
const HERO_IMAGE = "/images/hero-workbench.jpg";
const HERO_ALT =
  "A maker drawing up plans for a project at a workbench, rule and pencil in hand";

const HEADING = "Money follows the work";
const LEDE =
  "Donors fund a project in stages. The money sits in escrow and releases one milestone at a time, after the creator shows that stage is done.";

const EXPLORE = { label: "Explore campaigns", href: "/discover" };
const START = { label: "Start a campaign", href: "/create-campaign" };

function HeroCtas({
  ctaOrder,
  full,
}: {
  ctaOrder: "donor-first" | "creator-first";
  full?: boolean;
}) {
  const [lead, second] =
    ctaOrder === "donor-first" ? [EXPLORE, START] : [START, EXPLORE];

  return (
    <>
      <Link
        href={lead.href}
        className={hero.pill}
        style={full ? { width: "100%" } : undefined}
      >
        {lead.label}
      </Link>
      <Link
        href={second.href}
        className={`${hero.pill} ${hero.pillGhost}`}
        style={full ? { width: "100%" } : undefined}
      >
        {second.label}
      </Link>
    </>
  );
}

export function Hero({
  ctaOrder,
  stats: platformStats,
}: {
  ctaOrder: "donor-first" | "creator-first";
  stats: LandingStats;
}) {
  return (
    <>
      {/* Desktop */}
      <div className={styles.desktopOnly}>
        <section className={`${hero.hero} ${hero.heroDesktop}`}>
          <Image
            src={HERO_IMAGE}
            alt={HERO_ALT}
            fill
            priority
            sizes="100vw"
            className={hero.image}
          />
          <div className={hero.scrim} />

          <div className={`${hero.content} ${hero.contentDesktop}`}>
            <span className={`eyebrow ${hero.eyebrow}`}>Milestone funding</span>
            <h1
              className={`font-display ${hero.heading} ${hero.headingDesktop}`}
            >
              {HEADING}
            </h1>
            <p className={`${hero.lede} ${hero.ledeDesktop}`}>{LEDE}</p>

            <div className={hero.actions}>
              <HeroCtas ctaOrder={ctaOrder} />
            </div>

            <div className={hero.stats}>
              <span className="numeric">{platformStats.escrow}</span>
              <span className={hero.statsDot}>·</span>
              <span className="numeric">{platformStats.liveCampaigns}</span>
              <span className={hero.statsDot}>·</span>
              <span className="numeric">{platformStats.donors}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile */}
      <div className={styles.mobileOnly}>
        <section className={`${hero.hero} ${hero.heroMobile}`}>
          <Image
            src={HERO_IMAGE}
            alt={HERO_ALT}
            fill
            priority
            sizes="100vw"
            className={hero.image}
          />
          <div className={hero.scrim} />

          <div className={`${hero.content} ${hero.contentMobile}`}>
            <span className={`eyebrow ${hero.eyebrow}`}>Milestone funding</span>
            <h1 className={`font-display ${hero.heading} ${hero.headingMobile}`}>
              {HEADING}
            </h1>
            <p className={`${hero.lede} ${hero.ledeMobile}`}>{LEDE}</p>

            <div className={`${hero.actions} ${hero.actionsMobile}`}>
              <HeroCtas ctaOrder={ctaOrder} full />
            </div>

            <div className={`${hero.stats} ${hero.statsMobile}`}>
              <span className="numeric">{platformStats.escrow}</span>
              <span className="numeric">
                {platformStats.liveCampaigns} · {platformStats.donors}
              </span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
