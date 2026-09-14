"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ActionMessage, SubmitButton } from "@/components/ui/form-status";
import { subscribeToNewsletter } from "@/server/actions/public";
import styles from "./footer-newsletter.module.css";

/**
 * The landing page's closing footer: a newsletter card over the link columns.
 *
 * Ported from a Tailwind component onto this kit's design system. The email
 * field posts to a Server Action and is stored, rather than being decorative.
 *
 * The photograph is served from /public rather than hot-linked, matching the
 * hero's convention (see hero.tsx) so the footer makes no third-party request.
 */

const COLUMNS = [
  {
    title: "For donors",
    links: [
      { text: "Discover campaigns", href: "/discover" },
      { text: "How escrow works", href: "/how-escrow-works" },
      { text: "Escrow and refunds", href: "/escrow-and-refund-policy" },
      { text: "Your pledges", href: "/donor/pledges" },
    ],
  },
  {
    title: "For creators",
    links: [
      { text: "Start a campaign", href: "/create-campaign" },
      { text: "Payout terms", href: "/payout-terms" },
      { text: "Community guidelines", href: "/guidelines" },
      { text: "Creator dashboard", href: "/creator" },
    ],
  },
  {
    title: "Company",
    links: [
      { text: "Contact", href: "/contact" },
      { text: "Report a campaign", href: "/report-campaign" },
      { text: "Privacy", href: "/privacy" },
      { text: "Terms", href: "/terms" },
    ],
  },
];

const SOCIAL = [
  { icon: "instagram", label: "OneRaise on Instagram", href: "https://instagram.com/oneraise" },
  { icon: "twitter", label: "OneRaise on Twitter", href: "https://twitter.com/oneraise" },
  { icon: "linkedin", label: "OneRaise on LinkedIn", href: "https://linkedin.com/company/oneraise" },
  { icon: "youtube", label: "OneRaise on YouTube", href: "https://youtube.com/@oneraise" },
];

const LEGAL = [
  { text: "Terms of use", href: "/terms" },
  { text: "Privacy policy", href: "/privacy" },
  { text: "Cookies", href: "/cookies" },
  { text: "Escrow and refund policy", href: "/escrow-and-refund-policy" },
];

export function FooterNewsletter() {
  const [state, action] = useActionState(subscribeToNewsletter, {});

  return (
    <footer className={styles.footer}>
      <div aria-hidden="true" className={styles.glow} />
      <div className={styles.inner}>
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <h2 className={`font-display ${styles.cardTitle}`}>Watch the money move</h2>
            <p className={styles.cardText}>
              A short monthly note: which milestones released, which were disputed, and what the escrow ledger looked
              like at the end of the month. No campaign spam.
            </p>
            <form action={action} className={styles.form}>
              <div className={styles.formRow}>
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.org"
                  className={`ms-input ${styles.formField}`}
                  style={{ height: "var(--control-h-lg)" }}
                />
                <SubmitButton className="ms-btn ms-btn--primary ms-btn--lg" pendingLabel="Subscribing…">
                  Subscribe
                </SubmitButton>
              </div>
              <ActionMessage state={state} />
              <span className={styles.formNote}>
                One email a month. Unsubscribe in a click — we never pass your address to a creator.
              </span>
            </form>
          </div>
          <div className={styles.cardMedia}>
            <div className={styles.mediaFrame}>
              <Image
                src="/images/hero-seedlings.jpg"
                alt="Seedlings raised in trays at an allotment nursery"
                fill
                sizes="320px"
                className={styles.mediaImage}
              />
            </div>
          </div>
        </div>

        <div className={styles.columns}>
          <div className={styles.brand}>
            <Link href="/" className={`font-display ${styles.wordmarkRow}`}>
              <span aria-hidden="true" className={`font-display ${styles.mark}`}>
                OR
              </span>
              OneRaise
            </Link>
            <p className={styles.brandText}>
              Milestone crowdfunding. Escrow held by Onefold Trust Services, registered in England.
            </p>
            <div className={styles.socials}>
              {SOCIAL.map((item) => (
                <a key={item.label} href={item.href} className={styles.social} target="_blank" rel="noreferrer noopener">
                  <span className="sr-only">{item.label}</span>
                  <Icon name={item.icon} size={18} style={{ width: 18, height: 18 }} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title} className={styles.column}>
              <span className={`eyebrow ${styles.columnTitle}`}>{column.title}</span>
              <ul className={styles.columnList}>
                {column.links.map((link) => (
                  <li key={link.text}>
                    <Link href={link.href} className={styles.link}>
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.legal}>
          <span className="numeric">© {new Date().getUTCFullYear()} OneRaise</span>
          <div className={styles.legalLinks}>
            {LEGAL.map((link) => (
              <Link key={link.text} href={link.href} className={styles.legalLink}>
                {link.text}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterNewsletter;
