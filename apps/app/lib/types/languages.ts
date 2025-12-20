// ISO 639-1 language codes with their display names
import {
  ar,
  az,
  be,
  bg,
  bn,
  bs,
  ca,
  cs,
  cy,
  da,
  de,
  el,
  enUS,
  es,
  et,
  eu,
  faIR,
  fi,
  fr,
  gl,
  gu,
  he,
  hi,
  hr,
  hu,
  id,
  is,
  it,
  ja,
  ka,
  kk,
  kn,
  ko,
  Locale,
  lt,
  lv,
  mk,
  ms,
  nb,
  nl,
  pl,
  pt,
  ro,
  ru,
  sk,
  sl,
  sr,
  sv,
  ta,
  te,
  th,
  tr,
  uk,
  uz,
  vi,
  zhCN,
} from "date-fns/locale";

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  locale: Locale;
  uses12HourFormat: boolean;
}

// ISO 639-1 language codes with their display names
export const LANGUAGES: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    locale: enUS,
    uses12HourFormat: true,
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    locale: fr,
    uses12HourFormat: false,
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    locale: es,
    uses12HourFormat: false,
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    locale: de,
    uses12HourFormat: false,
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    locale: it,
    uses12HourFormat: false,
  },
  {
    code: "pt",
    name: "Portuguese",
    nativeName: "Português",
    locale: pt,
    uses12HourFormat: false,
  },
  {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    locale: ru,
    uses12HourFormat: false,
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    locale: ja,
    uses12HourFormat: false,
  },
  {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    locale: ko,
    uses12HourFormat: false,
  },
  {
    code: "zh",
    name: "Chinese",
    nativeName: "中文",
    locale: zhCN,
    uses12HourFormat: false,
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    locale: ar,
    uses12HourFormat: true,
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    locale: hi,
    uses12HourFormat: true,
  },
  {
    code: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    locale: tr,
    uses12HourFormat: false,
  },
  {
    code: "pl",
    name: "Polish",
    nativeName: "Polski",
    locale: pl,
    uses12HourFormat: false,
  },
  {
    code: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    locale: nl,
    uses12HourFormat: false,
  },
  {
    code: "sv",
    name: "Swedish",
    nativeName: "Svenska",
    locale: sv,
    uses12HourFormat: false,
  },
  {
    code: "da",
    name: "Danish",
    nativeName: "Dansk",
    locale: da,
    uses12HourFormat: false,
  },
  {
    code: "no",
    name: "Norwegian",
    nativeName: "Norsk",
    locale: nb,
    uses12HourFormat: false,
  },
  {
    code: "fi",
    name: "Finnish",
    nativeName: "Suomi",
    locale: fi,
    uses12HourFormat: false,
  },
  {
    code: "el",
    name: "Greek",
    nativeName: "Ελληνικά",
    locale: el,
    uses12HourFormat: false,
  },
  {
    code: "he",
    name: "Hebrew",
    nativeName: "עברית",
    locale: he,
    uses12HourFormat: false,
  },
  {
    code: "th",
    name: "Thai",
    nativeName: "ไทย",
    locale: th,
    uses12HourFormat: false,
  },
  {
    code: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    locale: vi,
    uses12HourFormat: false,
  },
  {
    code: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    locale: id,
    uses12HourFormat: false,
  },
  {
    code: "ms",
    name: "Malay",
    nativeName: "Bahasa Melayu",
    locale: ms,
    uses12HourFormat: true,
  },
  {
    code: "uk",
    name: "Ukrainian",
    nativeName: "Українська",
    locale: uk,
    uses12HourFormat: false,
  },
  {
    code: "cs",
    name: "Czech",
    nativeName: "Čeština",
    locale: cs,
    uses12HourFormat: false,
  },
  {
    code: "sk",
    name: "Slovak",
    nativeName: "Slovenčina",
    locale: sk,
    uses12HourFormat: false,
  },
  {
    code: "hu",
    name: "Hungarian",
    nativeName: "Magyar",
    locale: hu,
    uses12HourFormat: false,
  },
  {
    code: "ro",
    name: "Romanian",
    nativeName: "Română",
    locale: ro,
    uses12HourFormat: false,
  },
  {
    code: "bg",
    name: "Bulgarian",
    nativeName: "Български",
    locale: bg,
    uses12HourFormat: false,
  },
  {
    code: "hr",
    name: "Croatian",
    nativeName: "Hrvatski",
    locale: hr,
    uses12HourFormat: false,
  },
  {
    code: "sr",
    name: "Serbian",
    nativeName: "Српски",
    locale: sr,
    uses12HourFormat: false,
  },
  {
    code: "sl",
    name: "Slovenian",
    nativeName: "Slovenščina",
    locale: sl,
    uses12HourFormat: false,
  },
  {
    code: "et",
    name: "Estonian",
    nativeName: "Eesti",
    locale: et,
    uses12HourFormat: false,
  },
  {
    code: "lv",
    name: "Latvian",
    nativeName: "Latviešu",
    locale: lv,
    uses12HourFormat: false,
  },
  {
    code: "lt",
    name: "Lithuanian",
    nativeName: "Lietuvių",
    locale: lt,
    uses12HourFormat: false,
  },
  {
    code: "ca",
    name: "Catalan",
    nativeName: "Català",
    locale: ca,
    uses12HourFormat: false,
  },
  {
    code: "eu",
    name: "Basque",
    nativeName: "Euskera",
    locale: eu,
    uses12HourFormat: false,
  },
  {
    code: "gl",
    name: "Galician",
    nativeName: "Galego",
    locale: gl,
    uses12HourFormat: false,
  },
  {
    code: "is",
    name: "Icelandic",
    nativeName: "Íslenska",
    locale: is,
    uses12HourFormat: false,
  },
  {
    code: "ga",
    name: "Irish",
    nativeName: "Gaeilge",
    locale: enUS,
    uses12HourFormat: true,
  }, // Not available in date-fns
  {
    code: "mt",
    name: "Maltese",
    nativeName: "Malti",
    locale: enUS,
    uses12HourFormat: false,
  }, // Not available in date-fns
  {
    code: "cy",
    name: "Welsh",
    nativeName: "Cymraeg",
    locale: cy,
    uses12HourFormat: false,
  },
  {
    code: "fa",
    name: "Persian",
    nativeName: "فارسی",
    locale: faIR,
    uses12HourFormat: false,
  },
  {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    locale: enUS,
    uses12HourFormat: true,
  }, // Not available in date-fns
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    locale: bn,
    uses12HourFormat: true,
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    locale: ta,
    uses12HourFormat: true,
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    locale: te,
    uses12HourFormat: true,
  },
  {
    code: "ml",
    name: "Malayalam",
    nativeName: "മലയാളം",
    locale: enUS,
    uses12HourFormat: true,
  }, // Not available in date-fns
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    locale: kn,
    uses12HourFormat: true,
  },
  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    locale: gu,
    uses12HourFormat: true,
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    locale: enUS,
    uses12HourFormat: true,
  }, // Not available in date-fns
  {
    code: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    locale: enUS,
    uses12HourFormat: true,
  }, // Not available in date-fns
  {
    code: "ne",
    name: "Nepali",
    nativeName: "नेपाली",
    locale: enUS,
    uses12HourFormat: true,
  }, // Not available in date-fns
  {
    code: "si",
    name: "Sinhala",
    nativeName: "සිංහල",
    locale: enUS,
    uses12HourFormat: false,
  }, // Not available in date-fns
  {
    code: "my",
    name: "Burmese",
    nativeName: "မြန်မာ",
    locale: enUS,
    uses12HourFormat: false,
  }, // Not available in date-fns
  {
    code: "km",
    name: "Khmer",
    nativeName: "ភាសាខ្មែរ",
    locale: enUS,
    uses12HourFormat: false,
  }, // Not available in date-fns
  {
    code: "lo",
    name: "Lao",
    nativeName: "ລາວ",
    locale: enUS,
    uses12HourFormat: false,
  }, // Not available in date-fns
  {
    code: "ka",
    name: "Georgian",
    nativeName: "ქართული",
    locale: ka,
    uses12HourFormat: false,
  },
  {
    code: "am",
    name: "Amharic",
    nativeName: "አማርኛ",
    locale: enUS,
    uses12HourFormat: false,
  }, // Not available in date-fns
  {
    code: "sw",
    name: "Swahili",
    nativeName: "Kiswahili",
    locale: enUS,
    uses12HourFormat: false,
  }, // Not available in date-fns
  {
    code: "zu",
    name: "Zulu",
    nativeName: "isiZulu",
    locale: enUS,
    uses12HourFormat: false,
  }, // Not available in date-fns
  {
    code: "af",
    name: "Afrikaans",
    nativeName: "Afrikaans",
    locale: enUS,
    uses12HourFormat: false,
  }, // Not available in date-fns
  {
    code: "sq",
    name: "Albanian",
    nativeName: "Shqip",
    locale: enUS,
    uses12HourFormat: false,
  }, // Not available in date-fns
  {
    code: "az",
    name: "Azerbaijani",
    nativeName: "Azərbaycan",
    locale: az,
    uses12HourFormat: false,
  },
  {
    code: "be",
    name: "Belarusian",
    nativeName: "Беларуская",
    locale: be,
    uses12HourFormat: false,
  },
  {
    code: "bs",
    name: "Bosnian",
    nativeName: "Bosanski",
    locale: bs,
    uses12HourFormat: false,
  },
  {
    code: "mk",
    name: "Macedonian",
    nativeName: "Македонски",
    locale: mk,
    uses12HourFormat: false,
  },
  {
    code: "mn",
    name: "Mongolian",
    nativeName: "Монгол",
    locale: enUS,
    uses12HourFormat: false,
  }, // Not available in date-fns
  {
    code: "kk",
    name: "Kazakh",
    nativeName: "Қазақша",
    locale: kk,
    uses12HourFormat: false,
  },
  {
    code: "ky",
    name: "Kyrgyz",
    nativeName: "Кыргызча",
    locale: enUS,
    uses12HourFormat: false,
  }, // Not available in date-fns
  {
    code: "tg",
    name: "Tajik",
    nativeName: "Тоҷикӣ",
    locale: enUS,
    uses12HourFormat: false,
  }, // Not available in date-fns
  {
    code: "tk",
    name: "Turkmen",
    nativeName: "Türkmençe",
    locale: enUS,
    uses12HourFormat: false,
  }, // Not available in date-fns
  {
    code: "uz",
    name: "Uzbek",
    nativeName: "O'zbek",
    locale: uz,
    uses12HourFormat: false,
  },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

// Mapping from language codes to country codes for flag display
const LANGUAGE_TO_COUNTRY_MAP: Record<string, string> = {
  en: "us", // English -> United States
  ja: "jp", // Japanese -> Japan
  ko: "kr", // Korean -> South Korea
  zh: "cn", // Chinese -> China
  hi: "in", // Hindi -> India
  el: "gr", // Greek -> Greece
  he: "il", // Hebrew -> Israel
  uk: "ua", // Ukrainian -> Ukraine
  cs: "cz", // Czech -> Czech Republic
  da: "dk", // Danish -> Denmark
  sq: "al", // Albanian -> Albania
  kk: "kz", // Kazakh -> Kazakhstan
  lo: "la", // Lao -> Laos
  ur: "pk", // Urdu -> Pakistan
  fa: "ir", // Persian -> Iran
  ta: "in", // Tamil -> India (using India flag)
  te: "in", // Telugu -> India
  or: "in", // Odia -> India
  ti: "et", // Tigrinya -> Ethiopia
  sw: "tz", // Swahili -> Tanzania
  zu: "za", // Zulu -> South Africa
  xh: "za", // Xhosa -> South Africa
  ka: "ge", // Georgian -> Georgia
  bg: "bg", // Bulgarian -> Bulgaria
  hr: "hr", // Croatian -> Croatia
  sr: "rs", // Serbian -> Serbia
  sl: "si", // Slovenian -> Slovenia
  et: "ee", // Estonian -> Estonia
  lv: "lv", // Latvian -> Latvia
  lt: "lt", // Lithuanian -> Lithuania
  ca: "es", // Catalan -> Spain
  eu: "es", // Basque -> Spain
  gl: "es", // Galician -> Spain
  is: "is", // Icelandic -> Iceland
  ga: "ie", // Irish -> Ireland
  mt: "mt", // Maltese -> Malta
  cy: "gb", // Welsh -> United Kingdom
};

/**
 * Get flag URL for a language code
 */
export const getFlagUrl = (code: LanguageCode): string => {
  // Map language code to country code if needed
  const countryCode = LANGUAGE_TO_COUNTRY_MAP[code] || code;
  return `https://cdn.simplist.blog/flags/${countryCode}.svg`;
};

/**
 * Get date-fns locale for a language code
 * @param code - Language code
 * @returns - Date-fns locale
 */
export const getDateFnsLocale = (code: LanguageCode): Locale => {
  const language = LANGUAGES.find((lang) => lang.code === code);
  return language?.locale || enUS;
};

/**
 * Get language by code
 */
export const getLanguage = (code: LanguageCode): Language | undefined => {
  return LANGUAGES.find((lang) => lang.code === code);
};

/**
 * Get language display name
 */
export const getLanguageName = (code: LanguageCode): string => {
  const language = getLanguage(code);
  return language ? language.name : code.toUpperCase();
};

/**
 * Get native language name
 */
export const getNativeLanguageName = (code: LanguageCode): string => {
  const language = getLanguage(code);
  return language ? language.nativeName : code.toUpperCase();
};

/**
 * Check if language code is valid
 */
export const isValidLanguageCode = (code: string): code is LanguageCode => {
  return LANGUAGES.some((lang) => lang.code === code);
};

/**
 * Get all available languages sorted by name
 */
export const getAllLanguages = (): Language[] => {
  return [...LANGUAGES].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get popular languages (most commonly used)
 */
export const getPopularLanguages = (): Language[] => {
  const popularCodes = [
    "en",
    "fr",
    "es",
    "de",
    "it",
    "pt",
    "ru",
    "ja",
    "ko",
    "zh",
  ];
  return popularCodes
    .map((code) => LANGUAGES.find((lang) => lang.code === code)!)
    .filter(Boolean);
};

/**
 * Convert 24-hour format to 12-hour format
 * @param time24 - Time in 24-hour format
 * @returns Time in 12-hour format
 */
export const formatTime24to12 = (time24: string): string => {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
};
