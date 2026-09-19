import type { Metadata } from "next";
import { ContentPage } from "@/components/marketing/content-page";
import { howEscrowWorksContent } from "@/lib/legal-data";

export const metadata: Metadata = { title: "How escrow works | OneRaise" };

export default function HowEscrowWorksPage() {
  return <ContentPage data={howEscrowWorksContent} />;
}
