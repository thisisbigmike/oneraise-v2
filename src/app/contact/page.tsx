import type { Metadata } from "next";
import { ContactPage } from "@/components/marketing/contact-page";

export const metadata: Metadata = { title: "Contact us | OneRaise" };

export default function Contact() {
  return <ContactPage />;
}
