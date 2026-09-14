import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import styles from "./footer-column.module.css";

/**
 * The four-column site footer: brand and socials on the left, link columns and
 * contact details on the right, legal line underneath.
 *
 * Ported from a Tailwind component onto this kit's design system — tokens from
 * colors.css, `Icon` for the Lucide glyphs, and a CSS module for the
 * breakpoints and hover states that inline styles can't express.
 *
 * Everything is overridable through props, so the same footer serves a
 * different set of links wherever it is mounted.
 */

export interface FooterLink {
  text: string;
  href: string;
  /** Draws the pulsing dot — used for a "live" destination such as chat. */
  hasIndicator?: boolean;
}

export interface FooterColumnData {
  title: string;
  links: FooterLink[];
}

export interface FooterContact {
  email: string;
  phone: string;
  address: string;
}

export interface FooterColumnProps {
  company?: { name: string; initials: string; description: string; href: string };
  social?: { icon: string; label: string; href: string }[];
  columns?: FooterColumnData[];
  contact?: FooterContact;
  legal?: FooterLink[];
}

const DEFAULT_COMPANY = {
  name: "OneRaise",
  initials: "OR",
  description:
    "Milestone crowdfunding. Pledges are held in escrow and released one stage at a time, after donors have seen the work. Escrow held by Onefold Trust Services, registered in England.",
  href: "/",
};

const DEFAULT_SOCIAL = [
  { icon: "facebook", label: "OneRaise on Facebook", href: "https://facebook.com/oneraise" },
  { icon: "instagram", label: "OneRaise on Instagram", href: "https://instagram.com/oneraise" },
  { icon: "twitter", label: "OneRaise on Twitter", href: "https://twitter.com/oneraise" },
  { icon: "github", label: "OneRaise on GitHub", href: "https://github.com/oneraise" },
  { icon: "dribbble", label: "OneRaise on Dribbble", href: "https://dribbble.com/oneraise" },
];

const DEFAULT_COLUMNS: FooterColumnData[] = [
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
    title: "Help",
    links: [
      { text: "Contact support", href: "/contact" },
      { text: "Report a campaign", href: "/report-campaign" },
      { text: "Live chat", href: "/contact", hasIndicator: true },
    ],
  },
];

const DEFAULT_CONTACT: FooterContact = {
  email: "support@oneraise.org",
  phone: "+44 20 7946 0312",
  address: "Onefold Trust Services, 14 Bevis Marks, London EC3A 7BA",
};

const DEFAULT_LEGAL: FooterLink[] = [
  { text: "Privacy", href: "/privacy" },
  { text: "Terms", href: "/terms" },
  { text: "Cookies", href: "/cookies" },
];

export function FooterColumns({
  company = DEFAULT_COMPANY,
  social = DEFAULT_SOCIAL,
  columns = DEFAULT_COLUMNS,
  contact = DEFAULT_CONTACT,
  legal = DEFAULT_LEGAL,
}: FooterColumnProps) {
  const contactRows = [
    { icon: "mail", text: contact.email, href: `mailto:${contact.email}` },
    { icon: "phone", text: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}` },
    { icon: "map-pin", text: contact.address, href: null },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.columns}>
          <div className={styles.brand}>
            <Link href={company.href} className={`font-display ${styles.wordmark}`}>
              <span aria-hidden="true" className={`font-display ${styles.mark}`}>
                {company.initials}
              </span>
              {company.name}
            </Link>

            <p className={styles.description}>{company.description}</p>

            <ul className={styles.socials}>
              {social.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className={styles.social} rel="noreferrer noopener" target="_blank">
                    <span className="sr-only">{item.label}</span>
                    <Icon name={item.icon} size={20} style={{ width: 20, height: 20 }} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.links}>
            {columns.map((column) => (
              <div key={column.title} className={styles.column}>
                <span className={`eyebrow ${styles.columnTitle}`}>{column.title}</span>
                <ul className={styles.columnList}>
                  {column.links.map((link) => (
                    <li key={link.text}>
                      <Link href={link.href} className={`${styles.link} ${link.hasIndicator ? styles.liveLink : ""}`}>
                        {link.text}
                        {link.hasIndicator && (
                          <span aria-hidden="true" className={styles.pulse}>
                            <span className={styles.pulseRing} />
                            <span className={styles.pulseDot} />
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className={styles.column}>
              <span className={`eyebrow ${styles.columnTitle}`}>Contact</span>
              <ul className={styles.columnList}>
                {contactRows.map((row) => (
                  <li key={row.text}>
                    {row.href ? (
                      <a href={row.href} className={styles.contactRow}>
                        <span className={styles.contactIcon}>
                          <Icon name={row.icon} size={16} style={{ width: 16, height: 16 }} />
                        </span>
                        <span>{row.text}</span>
                      </a>
                    ) : (
                      <span className={styles.contactRow}>
                        <span className={styles.contactIcon}>
                          <Icon name={row.icon} size={16} style={{ width: 16, height: 16 }} />
                        </span>
                        <address className={styles.address}>{row.text}</address>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.legal}>
          <span className="numeric">© {new Date().getUTCFullYear()} {company.name}</span>
          <div className={styles.legalLinks}>
            {legal.map((link) => (
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

export default FooterColumns;
