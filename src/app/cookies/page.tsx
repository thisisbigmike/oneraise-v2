import type { Metadata } from "next";
import { ContentPage } from "@/components/marketing/content-page";
import { cookiesContent } from "@/lib/legal-data";

export const metadata: Metadata = { title: "Cookie policy | OneRaise" };

export default function CookiesPage() {
  return <ContentPage data={cookiesContent} />;
}
