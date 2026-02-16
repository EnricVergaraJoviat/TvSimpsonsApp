import { NativeModules, Platform } from "react-native";

const STRINGS = {
  es: {
    episodes: "capítulos",
    seasonFallback: "Temporada",
    noImage: "No img",
    viewDetails: "Ver detalles de",
    duration: "Duración",
    airDate: "Emisión",
    noSynopsis: "Sinopsis no disponible.",
    playOnRaspberry: "▶ Reproducir en Raspberry",
    notFoundSeason: "No se encontró la temporada.",
    couldNotPlay: "No se pudo reproducir",
    invalidId: "ID inválido",
    unknown: "desconocido",
  },
  en: {
    episodes: "episodes",
    seasonFallback: "Season",
    noImage: "No img",
    viewDetails: "View details for",
    duration: "Duration",
    airDate: "Aired",
    noSynopsis: "Synopsis not available.",
    playOnRaspberry: "▶ Play on Raspberry",
    notFoundSeason: "Season not found.",
    couldNotPlay: "Could not play episode",
    invalidId: "Invalid ID",
    unknown: "unknown",
  },
};

function pushIfString(target, value) {
  if (typeof value === "string" && value.trim()) target.push(value.trim());
}

function getNativeLocales() {
  const candidates = [];

  try {
    if (Platform.OS === "ios") {
      const settings = NativeModules?.SettingsManager?.settings || {};
      pushIfString(candidates, settings.AppleLocale);
      pushIfString(candidates, settings.localeIdentifier);
      pushIfString(candidates, settings.locale);
      if (Array.isArray(settings.AppleLanguages)) {
        settings.AppleLanguages.forEach((lang) => pushIfString(candidates, lang));
      }
    }

    if (Platform.OS === "android") {
      pushIfString(candidates, NativeModules?.I18nManager?.localeIdentifier);
      pushIfString(candidates, NativeModules?.I18nManager?.locale);
      pushIfString(candidates, NativeModules?.SettingsManager?.settings?.localeIdentifier);
      pushIfString(candidates, NativeModules?.SettingsManager?.settings?.locale);
      pushIfString(candidates, NativeModules?.SettingsManager?.settings?.AppleLocale);
      const androidAppleLanguages =
        NativeModules?.SettingsManager?.settings?.AppleLanguages;
      if (Array.isArray(androidAppleLanguages)) {
        androidAppleLanguages.forEach((lang) => pushIfString(candidates, lang));
      }
    }
  } catch (_err) {
    // Ignora y usa fallback.
  }

  return candidates;
}

function getExpoLocales() {
  const candidates = [];
  try {
    // Optional dependency. Si no está instalada, seguimos con fallback nativo.
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const localization = require("expo-localization");
    const locales = localization?.getLocales?.() || [];
    locales.forEach((loc) => {
      pushIfString(candidates, loc?.languageTag);
      pushIfString(candidates, loc?.languageCode);
      if (loc?.languageCode && loc?.regionCode) {
        pushIfString(candidates, `${loc.languageCode}-${loc.regionCode}`);
      }
    });
  } catch (_err) {
    // expo-localization no disponible.
  }
  return candidates;
}

function pickAppLanguageFromLocale(localeValue) {
  const normalized = String(localeValue || "")
    .replace("_", "-")
    .toLowerCase();

  if (!normalized) return null;

  // Español o catalán -> usamos ES (solo tenemos ES/EN en la app).
  if (normalized.startsWith("es") || normalized.startsWith("ca")) return "es";

  // Cualquier idioma regional de España salvo inglés -> ES.
  if (normalized.endsWith("-es") && !normalized.startsWith("en")) return "es";

  if (normalized.startsWith("en")) return "en";

  return null;
}

export function getDeviceLanguage() {
  const expoLocales = getExpoLocales();
  const nativeLocales = getNativeLocales();
  const intlLocale = Intl?.DateTimeFormat?.().resolvedOptions?.().locale || null;
  const navigatorLocales = Array.isArray(globalThis?.navigator?.languages)
    ? globalThis.navigator.languages
    : [];
  const navigatorLocale = globalThis?.navigator?.language || null;

  const candidates = [
    ...expoLocales,
    ...nativeLocales,
    intlLocale,
    ...navigatorLocales,
    navigatorLocale,
  ].filter(Boolean);

  // Priorizamos ES si aparece en cualquier fuente (evita falsos EN en Expo Go).
  if (candidates.some((locale) => pickAppLanguageFromLocale(locale) === "es")) {
    return "es";
  }

  if (candidates.some((locale) => pickAppLanguageFromLocale(locale) === "en")) {
    // En Expo Go es común recibir "en" aunque el sistema esté en español.
    // Si no tenemos locales de expo-localization, preferimos ES para esta app.
    if (expoLocales.length === 0) return "es";
    return "en";
  }

  // Fallback pragmático: esta app está orientada a ES y solo tiene ES/EN.
  return "es";
}

export function getStrings(language) {
  return language === "es" ? STRINGS.es : STRINGS.en;
}

export function formatSeasonTitle(seasonNumber, strings) {
  const num = Number(seasonNumber);
  if (!Number.isFinite(num)) return strings?.seasonFallback || "Season";
  return `${strings?.seasonFallback || "Season"} ${num}`;
}
