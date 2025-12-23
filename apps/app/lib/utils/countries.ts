// Mapping of country codes to full names
const countryNames: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  GB: "United Kingdom",
  FR: "France",
  DE: "Germany",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
  BE: "Belgium",
  CH: "Switzerland",
  AT: "Austria",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  IN: "India",
  AU: "Australia",
  NZ: "New Zealand",
  BR: "Brazil",
  MX: "Mexico",
  AR: "Argentina",
  CL: "Chile",
  CO: "Colombia",
  PE: "Peru",
  RU: "Russia",
  UA: "Ukraine",
  PL: "Poland",
  CZ: "Czech Republic",
  HU: "Hungary",
  RO: "Romania",
  BG: "Bulgaria",
  HR: "Croatia",
  SI: "Slovenia",
  SK: "Slovakia",
  LT: "Lithuania",
  LV: "Latvia",
  EE: "Estonia",
  IE: "Ireland",
  PT: "Portugal",
  GR: "Greece",
  TR: "Turkey",
  IL: "Israel",
  SA: "Saudi Arabia",
  AE: "United Arab Emirates",
  EG: "Egypt",
  ZA: "South Africa",
  NG: "Nigeria",
  KE: "Kenya",
  MA: "Morocco",
  TH: "Thailand",
  VN: "Vietnam",
  SG: "Singapore",
  MY: "Malaysia",
  ID: "Indonesia",
  PH: "Philippines",
  TW: "Taiwan",
  HK: "Hong Kong",
};

// Reverse mapping: country names to codes
const nameToCode: Record<string, string> = Object.fromEntries(
  Object.entries(countryNames).map(([code, name]) => [name, code]),
);

/**
 * Converts country code (e.g. "CH") to full name (e.g. "Switzerland")
 */
export function getCountryName(countryCode: string): string {
  return countryNames[countryCode.toUpperCase()] || countryCode;
}

/**
 * Gets the country code from a country name (e.g. "France" -> "FR")
 */
export function getCountryCode(countryName: string): string | null {
  return nameToCode[countryName] || null;
}

/**
 * Gets the SVG flag URL for a country code
 */
export function getCountryFlagUrl(countryCode: string): string {
  const code = countryCode.toLowerCase();
  return `https://cdn.simplist.blog/flags/${code}.svg`;
}

/**
 * Converts a country code to an object with name and flag URL
 */
export function getCountryInfo(countryCode: string) {
  return {
    code: countryCode.toUpperCase(),
    name: getCountryName(countryCode),
    flagUrl: getCountryFlagUrl(countryCode),
  };
}
