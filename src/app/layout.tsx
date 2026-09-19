import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ViewerProvider } from "@/components/viewer-context";
import { getViewer } from "@/server/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "OneRaise | Milestone crowdfunding",
  description:
    "Donors fund a project in stages. The money sits in escrow and releases one milestone at a time, after the creator shows that stage is done.",
};

// Reading the session cookie here renders every route per request: the whole
// site reflects the live database and whoever is signed in.
export default async function RootLayout({ children }: { children: ReactNode }) {
  const viewer = await getViewer();
  return (
    <html lang="en">
      <body>
        <ViewerProvider viewer={viewer}>{children}</ViewerProvider>
      </body>
    </html>
  );
}
