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

function getNativeLocale() {
  const candidates = [];

  try {
    if (Platform.OS === "ios") {
      const settings = NativeModules?.SettingsManager?.settings || {};
      candidates.push(settings.AppleLocale);
      candidates.push(settings.AppleLanguages?.[0]);
      candidates.push(settings.localeIdentifier);
      candidates.push(settings.locale);
    }

    if (Platform.OS === "android") {
      candidates.push(NativeModules?.I18nManager?.localeIdentifier);
      candidates.push(NativeModules?.I18nManager?.locale);
      candidates.push(NativeModules?.SettingsManager?.settings?.localeIdentifier);
      candidates.push(NativeModules?.SettingsManager?.settings?.locale);
      candidates.push(NativeModules?.SettingsManager?.settings?.AppleLocale);
      candidates.push(NativeModules?.SettingsManager?.settings?.AppleLanguages?.[0]);
    }
  } catch (_err) {
    // Ignora y usa fallback.
  }

  return candidates.find((v) => typeof v === "string" && v.trim().length > 0) || null;
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
  const nativeLocale = getNativeLocale();
  const intlLocale = Intl?.DateTimeFormat?.().resolvedOptions?.().locale || null;
  const navigatorLocale = globalThis?.navigator?.language || null;

  const byNative = pickAppLanguageFromLocale(nativeLocale);
  if (byNative) return byNative;

  const byIntl = pickAppLanguageFromLocale(intlLocale);
  if (byIntl) return byIntl;

  const byNavigator = pickAppLanguageFromLocale(navigatorLocale);
  if (byNavigator) return byNavigator;

  // Fallback pragmático: esta app está orientada a ES y solo tiene ES/EN.
  return "es";
}

export function getStrings(language) {
  return language === "es" ? STRINGS.es : STRINGS.en;
}
