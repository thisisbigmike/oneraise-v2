import { FooterColumns } from "@/components/ui/footer-column";

/**
 * The site footer. Every marketing and content page mounts this; the landing
 * page uses the newsletter variant instead (see footer-newsletter.tsx).
 *
 * The layout itself lives in @/components/ui/footer-column, which is the
 * reusable, prop-driven component. This wrapper keeps the import path every
 * page already uses.
 */
export function Footer() {
  return <FooterColumns />;
}
