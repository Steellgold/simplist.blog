// ISO 639-1 language codes with their display names
import { 
  enUS, fr, es, de, it, pt, ru, ja, ko, zhCN, ar, hi, tr, pl, nl, sv, da, 
  nb, fi, el, he, th, vi, id, ms, uk, cs, sk, hu, ro, bg, hr, sr, sl, et, 
  lv, lt, ca, eu, gl, is, cy, faIR, bn, ta, te, gu, kn, ka, mk, az, be, bs, 
  kk, uz,
  Locale
} from "date-fns/locale"


// ISO 639-1 language codes with their display names
export const LANGUAGES: {
  code: string
  name: string
  nativeName: string
  locale: Locale
}[] = [
  { code: "en", name: "English", nativeName: "English", locale: enUS },
  { code: "fr", name: "French", nativeName: "Français", locale: fr },
  { code: "es", name: "Spanish", nativeName: "Español", locale: es },
  { code: "de", name: "German", nativeName: "Deutsch", locale: de },
  { code: "it", name: "Italian", nativeName: "Italiano", locale: it },
  { code: "pt", name: "Portuguese", nativeName: "Português", locale: pt },
  { code: "ru", name: "Russian", nativeName: "Русский", locale: ru },
  { code: "ja", name: "Japanese", nativeName: "日本語", locale: ja },
  { code: "ko", name: "Korean", nativeName: "한국어", locale: ko },
  { code: "zh", name: "Chinese", nativeName: "中文", locale: zhCN },
  { code: "ar", name: "Arabic", nativeName: "العربية", locale: ar },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", locale: hi },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", locale: tr },
  { code: "pl", name: "Polish", nativeName: "Polski", locale: pl },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", locale: nl },
  { code: "sv", name: "Swedish", nativeName: "Svenska", locale: sv },
  { code: "da", name: "Danish", nativeName: "Dansk", locale: da },
  { code: "no", name: "Norwegian", nativeName: "Norsk", locale: nb },
  { code: "fi", name: "Finnish", nativeName: "Suomi", locale: fi },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", locale: el },
  { code: "he", name: "Hebrew", nativeName: "עברית", locale: he },
  { code: "th", name: "Thai", nativeName: "ไทย", locale: th },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", locale: vi },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", locale: id },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", locale: ms },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", locale: uk },
  { code: "cs", name: "Czech", nativeName: "Čeština", locale: cs },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina", locale: sk },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", locale: hu },
  { code: "ro", name: "Romanian", nativeName: "Română", locale: ro },
  { code: "bg", name: "Bulgarian", nativeName: "Български", locale: bg },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski", locale: hr },
  { code: "sr", name: "Serbian", nativeName: "Српски", locale: sr },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina", locale: sl },
  { code: "et", name: "Estonian", nativeName: "Eesti", locale: et },
  { code: "lv", name: "Latvian", nativeName: "Latviešu", locale: lv },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvių", locale: lt },
  { code: "ca", name: "Catalan", nativeName: "Català", locale: ca },
  { code: "eu", name: "Basque", nativeName: "Euskera", locale: eu },
  { code: "gl", name: "Galician", nativeName: "Galego", locale: gl },
  { code: "is", name: "Icelandic", nativeName: "Íslenska", locale: is },
  { code: "ga", name: "Irish", nativeName: "Gaeilge", locale: enUS }, // Not available in date-fns
  { code: "mt", name: "Maltese", nativeName: "Malti", locale: enUS }, // Not available in date-fns
  { code: "cy", name: "Welsh", nativeName: "Cymraeg", locale: cy },
  { code: "fa", name: "Persian", nativeName: "فارسی", locale: faIR },
  { code: "ur", name: "Urdu", nativeName: "اردو", locale: enUS }, // Not available in date-fns
  { code: "bn", name: "Bengali", nativeName: "বাংলা", locale: bn },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", locale: ta },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", locale: te },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", locale: enUS }, // Not available in date-fns
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", locale: kn },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", locale: gu },
  { code: "mr", name: "Marathi", nativeName: "मराठी", locale: enUS }, // Not available in date-fns
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", locale: enUS }, // Not available in date-fns
  { code: "ne", name: "Nepali", nativeName: "नेपाली", locale: enUS }, // Not available in date-fns
  { code: "si", name: "Sinhala", nativeName: "සිංහල", locale: enUS }, // Not available in date-fns
  { code: "my", name: "Burmese", nativeName: "မြန်မာ", locale: enUS }, // Not available in date-fns
  { code: "km", name: "Khmer", nativeName: "ភាសាខ្មែរ", locale: enUS }, // Not available in date-fns
  { code: "lo", name: "Lao", nativeName: "ລາວ", locale: enUS }, // Not available in date-fns
  { code: "ka", name: "Georgian", nativeName: "ქართული", locale: ka },
  { code: "am", name: "Amharic", nativeName: "አማርኛ", locale: enUS }, // Not available in date-fns
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", locale: enUS }, // Not available in date-fns
  { code: "zu", name: "Zulu", nativeName: "isiZulu", locale: enUS }, // Not available in date-fns
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans", locale: enUS }, // Not available in date-fns
  { code: "sq", name: "Albanian", nativeName: "Shqip", locale: enUS }, // Not available in date-fns
  { code: "az", name: "Azerbaijani", nativeName: "Azərbaycan", locale: az },
  { code: "be", name: "Belarusian", nativeName: "Беларуская", locale: be },
  { code: "bs", name: "Bosnian", nativeName: "Bosanski", locale: bs },
  { code: "mk", name: "Macedonian", nativeName: "Македонски", locale: mk },
  { code: "mn", name: "Mongolian", nativeName: "Монгол", locale: enUS }, // Not available in date-fns
  { code: "kk", name: "Kazakh", nativeName: "Қазақша", locale: kk },
  { code: "ky", name: "Kyrgyz", nativeName: "Кыргызча", locale: enUS }, // Not available in date-fns
  { code: "tg", name: "Tajik", nativeName: "Тоҷикӣ", locale: enUS }, // Not available in date-fns
  { code: "tk", name: "Turkmen", nativeName: "Türkmençe", locale: enUS }, // Not available in date-fns
  { code: "uz", name: "Uzbek", nativeName: "O'zbek", locale: uz },
] as const


export type LanguageCode = typeof LANGUAGES[number]["code"]

export interface Language {
  code: LanguageCode
  name: string
  nativeName: string
  locale: Locale
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
 * Get date-fns locale for a language code
 * @param code - Language code
 * @returns - Date-fns locale
 */
export const getDateFnsLocale = (code: LanguageCode): Locale => {
  const language = LANGUAGES.find(lang => lang.code === code)
  return language?.locale || enUS
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