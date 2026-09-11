"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Viewer } from "@/lib/view-models";

/** The signed-in visitor, resolved once per request in the root layout so
 *  client components (headers, nav chips) can render the right account. */
const ViewerContext = createContext<Viewer | null>(null);

export function ViewerProvider({ viewer, children }: { viewer: Viewer | null; children: ReactNode }) {
  return <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>;
}

export function useViewer(): Viewer | null {
  return useContext(ViewerContext);
}
