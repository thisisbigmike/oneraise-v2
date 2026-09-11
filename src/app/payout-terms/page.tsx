import type { Metadata } from "next";
import { ContentPage } from "@/components/marketing/content-page";
import { payoutTermsContent } from "@/lib/legal-data";

export const metadata: Metadata = { title: "Payout terms — OneRaise" };

export default function PayoutTermsPage() {
  return <ContentPage data={payoutTermsContent} />;
}
