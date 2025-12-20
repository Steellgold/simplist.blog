/**
 * Language enum with ISO 639-1 codes
 */
export enum Language {
  ENGLISH = "en",
  FRENCH = "fr",
  SPANISH = "es",
  GERMAN = "de",
  ITALIAN = "it",
  PORTUGUESE = "pt",
  RUSSIAN = "ru",
  JAPANESE = "ja",
  KOREAN = "ko",
  CHINESE = "zh",
  ARABIC = "ar",
  HINDI = "hi",
  TURKISH = "tr",
  POLISH = "pl",
  DUTCH = "nl",
  SWEDISH = "sv",
  DANISH = "da",
  NORWEGIAN = "no",
  FINNISH = "fi",
  GREEK = "el",
  HEBREW = "he",
  THAI = "th",
  VIETNAMESE = "vi",
  INDONESIAN = "id",
  MALAY = "ms",
  UKRAINIAN = "uk",
  CZECH = "cs",
  SLOVAK = "sk",
  HUNGARIAN = "hu",
  ROMANIAN = "ro",
  BULGARIAN = "bg",
  CROATIAN = "hr",
  SERBIAN = "sr",
  SLOVENIAN = "sl",
  ESTONIAN = "et",
  LATVIAN = "lv",
  LITHUANIAN = "lt",
  CATALAN = "ca",
  BASQUE = "eu",
  GALICIAN = "gl",
  ICELANDIC = "is",
  IRISH = "ga",
  MALTESE = "mt",
  WELSH = "cy",
  PERSIAN = "fa",
  URDU = "ur",
  BENGALI = "bn",
  TAMIL = "ta",
  TELUGU = "te",
  MALAYALAM = "ml",
  KANNADA = "kn",
  GUJARATI = "gu",
  MARATHI = "mr",
  PUNJABI = "pa",
  NEPALI = "ne",
  SINHALA = "si",
  BURMESE = "my",
  KHMER = "km",
  LAO = "lo",
  GEORGIAN = "ka",
  AMHARIC = "am",
  SWAHILI = "sw",
  ZULU = "zu",
  AFRIKAANS = "af",
  ALBANIAN = "sq",
  AZERBAIJANI = "az",
  BELARUSIAN = "be",
  BOSNIAN = "bs",
  MACEDONIAN = "mk",
  MONGOLIAN = "mn",
  KAZAKH = "kk",
  KYRGYZ = "ky",
  TAJIK = "tg",
  TURKMEN = "tk",
  UZBEK = "uz",
}

/**
 * Language code type (ISO 639-1)
 */
export type LanguageCode = `${Language}`;

/**
 * Check if a string is a valid language code
 */
export const isValidLanguageCode = (code: string): code is LanguageCode => {
  return Object.values(Language).includes(code as Language);
};

/**
 * Get all available language codes
 */
export const getAllLanguageCodes = (): LanguageCode[] => {
  return Object.values(Language) as LanguageCode[];
};

/**
 * Popular languages commonly used
 */
export const POPULAR_LANGUAGES: LanguageCode[] = [
  Language.ENGLISH,
  Language.FRENCH,
  Language.SPANISH,
  Language.GERMAN,
  Language.ITALIAN,
  Language.PORTUGUESE,
  Language.RUSSIAN,
  Language.JAPANESE,
  Language.KOREAN,
  Language.CHINESE,
];
