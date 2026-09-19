import type { Metadata } from "next";
import { ContentPage } from "@/components/marketing/content-page";
import { termsContent } from "@/lib/legal-data";

export const metadata: Metadata = { title: "Terms of use | OneRaise" };

export default function TermsPage() {
  return <ContentPage data={termsContent} />;
}
