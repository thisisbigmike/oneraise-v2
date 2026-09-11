import "server-only";
import { connection } from "next/server";

/** The time this request is being rendered at. Waits for the request, so it is never frozen into a prerender. */
export async function requestNow(): Promise<number> {
  await connection();
  return Date.now();
}
