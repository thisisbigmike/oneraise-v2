/** Countries an account can be opened from, and the currency each pledges in. */
export const COUNTRIES: { name: string; currency: string }[] = [
  { name: "Nigeria", currency: "NGN · Nigerian naira" },
  { name: "Ghana", currency: "GHS · Ghanaian cedi" },
  { name: "Kenya", currency: "KES · Kenyan shilling" },
  { name: "South Africa", currency: "ZAR · South African rand" },
  { name: "United Kingdom", currency: "GBP · Pound sterling" },
  { name: "Ireland", currency: "EUR · Euro" },
  { name: "United States", currency: "USD · US dollar" },
  { name: "Canada", currency: "CAD · Canadian dollar" },
  { name: "Germany", currency: "EUR · Euro" },
  { name: "India", currency: "INR · Indian rupee" },
];

export const COUNTRY_NAMES = COUNTRIES.map((c) => c.name);

export function currencyFor(country: string): string {
  return COUNTRIES.find((c) => c.name === country)?.currency ?? "USD · US dollar";
}
