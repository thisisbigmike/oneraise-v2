import type { Metadata } from "next";
import { ContentPage } from "@/components/marketing/content-page";
import { guidelinesContent } from "@/lib/legal-data";

export const metadata: Metadata = { title: "Community guidelines | OneRaise" };

export default function GuidelinesPage() {
  return <ContentPage data={guidelinesContent} />;
}
