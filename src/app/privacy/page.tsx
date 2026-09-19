import type { Metadata } from "next";
import { ContentPage } from "@/components/marketing/content-page";
import { privacyContent } from "@/lib/legal-data";

export const metadata: Metadata = { title: "Privacy policy | OneRaise" };

export default function PrivacyPage() {
  return <ContentPage data={privacyContent} />;
}
