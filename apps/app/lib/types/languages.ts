// ISO 639-1 language codes with their display names
export const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά" },
  { code: "he", name: "Hebrew", nativeName: "עברית" },
  { code: "th", name: "Thai", nativeName: "ไทย" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська" },
  { code: "cs", name: "Czech", nativeName: "Čeština" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "ro", name: "Romanian", nativeName: "Română" },
  { code: "bg", name: "Bulgarian", nativeName: "Български" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski" },
  { code: "sr", name: "Serbian", nativeName: "Српски" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina" },
  { code: "et", name: "Estonian", nativeName: "Eesti" },
  { code: "lv", name: "Latvian", nativeName: "Latviešu" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvių" },
  { code: "ca", name: "Catalan", nativeName: "Català" },
  { code: "eu", name: "Basque", nativeName: "Euskera" },
  { code: "gl", name: "Galician", nativeName: "Galego" },
  { code: "is", name: "Icelandic", nativeName: "Íslenska" },
  { code: "ga", name: "Irish", nativeName: "Gaeilge" },
  { code: "mt", name: "Maltese", nativeName: "Malti" },
  { code: "cy", name: "Welsh", nativeName: "Cymraeg" },
  { code: "fa", name: "Persian", nativeName: "فارسی" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
  { code: "si", name: "Sinhala", nativeName: "සිංහල" },
  { code: "my", name: "Burmese", nativeName: "မြန်မာ" },
  { code: "km", name: "Khmer", nativeName: "ភាសាខ្មែរ" },
  { code: "lo", name: "Lao", nativeName: "ລາວ" },
  { code: "ka", name: "Georgian", nativeName: "ქართული" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
  { code: "zu", name: "Zulu", nativeName: "isiZulu" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans" },
  { code: "sq", name: "Albanian", nativeName: "Shqip" },
  { code: "az", name: "Azerbaijani", nativeName: "Azərbaycan" },
  { code: "be", name: "Belarusian", nativeName: "Беларуская" },
  { code: "bs", name: "Bosnian", nativeName: "Bosanski" },
  { code: "mk", name: "Macedonian", nativeName: "Македонски" },
  { code: "mn", name: "Mongolian", nativeName: "Монгол" },
  { code: "kk", name: "Kazakh", nativeName: "Қазақша" },
  { code: "ky", name: "Kyrgyz", nativeName: "Кыргызча" },
  { code: "tg", name: "Tajik", nativeName: "Тоҷикӣ" },
  { code: "tk", name: "Turkmen", nativeName: "Türkmençe" },
  { code: "uz", name: "Uzbek", nativeName: "O'zbek" },
] as const

export type LanguageCode = typeof LANGUAGES[number]["code"]

export interface Language {
  code: LanguageCode
  name: string
  nativeName: string
}

// Mapping from language codes to country codes for flag display
const LANGUAGE_TO_COUNTRY_MAP: Record<string, string> = {
  en: 'us',    // English -> United States
  ja: 'jp',    // Japanese -> Japan  
  ko: 'kr',    // Korean -> South Korea
  zh: 'cn',    // Chinese -> China
  hi: 'in',    // Hindi -> India
  el: 'gr',    // Greek -> Greece
  he: 'il',    // Hebrew -> Israel
  uk: 'ua',    // Ukrainian -> Ukraine
  cs: 'cz',    // Czech -> Czech Republic
  da: 'dk',    // Danish -> Denmark
  sq: 'al',    // Albanian -> Albania
  kk: 'kz',    // Kazakh -> Kazakhstan
  lo: 'la',    // Lao -> Laos
  ur: 'pk',    // Urdu -> Pakistan
  fa: 'ir',    // Persian -> Iran
  ta: 'in',    // Tamil -> India (using India flag)
  te: 'in',    // Telugu -> India
  or: 'in',    // Odia -> India
  ti: 'et',    // Tigrinya -> Ethiopia
  sw: 'tz',    // Swahili -> Tanzania
  zu: 'za',    // Zulu -> South Africa
  xh: 'za',    // Xhosa -> South Africa
  ka: 'ge',    // Georgian -> Georgia
  bg: 'bg',    // Bulgarian -> Bulgaria
  hr: 'hr',    // Croatian -> Croatia
  sr: 'rs',    // Serbian -> Serbia
  sl: 'si',    // Slovenian -> Slovenia
  et: 'ee',    // Estonian -> Estonia
  lv: 'lv',    // Latvian -> Latvia
  lt: 'lt',    // Lithuanian -> Lithuania
  ca: 'es',    // Catalan -> Spain
  eu: 'es',    // Basque -> Spain
  gl: 'es',    // Galician -> Spain
  is: 'is',    // Icelandic -> Iceland
  ga: 'ie',    // Irish -> Ireland
  mt: 'mt',    // Maltese -> Malta
  cy: 'gb',    // Welsh -> United Kingdom
}

/**
 * Get flag URL for a language code
 */
export const getFlagUrl = (code: LanguageCode): string => {
  // Map language code to country code if needed
  const countryCode = LANGUAGE_TO_COUNTRY_MAP[code] || code
  return `https://cdn.simplist.blog/flags/${countryCode}.svg`
}

/**
 * Get language by code
 */
export const getLanguage = (code: LanguageCode): Language | undefined => {
  return LANGUAGES.find(lang => lang.code === code)
}

/**
 * Get language display name
 */
export const getLanguageName = (code: LanguageCode): string => {
  const language = getLanguage(code)
  return language ? language.name : code.toUpperCase()
}

/**
 * Get native language name
 */
export const getNativeLanguageName = (code: LanguageCode): string => {
  const language = getLanguage(code)
  return language ? language.nativeName : code.toUpperCase()
}

/**
 * Check if language code is valid
 */
export const isValidLanguageCode = (code: string): code is LanguageCode => {
  return LANGUAGES.some(lang => lang.code === code)
}

/**
 * Get all available languages sorted by name
 */
export const getAllLanguages = (): Language[] => {
  return [...LANGUAGES].sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Get popular languages (most commonly used)
 */
export const getPopularLanguages = (): Language[] => {
  const popularCodes = ["en", "fr", "es", "de", "it", "pt", "ru", "ja", "ko", "zh"]
  return popularCodes.map(code => LANGUAGES.find(lang => lang.code === code)!).filter(Boolean)
}