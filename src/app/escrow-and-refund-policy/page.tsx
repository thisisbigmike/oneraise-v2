import type { Metadata } from "next";
import { ContentPage } from "@/components/marketing/content-page";
import { escrowAndRefundPolicyContent } from "@/lib/legal-data";

export const metadata: Metadata = {
  title: "Escrow and refund policy — OneRaise",
};

export default function EscrowAndRefundPolicyPage() {
  return <ContentPage data={escrowAndRefundPolicyContent} />;
}
