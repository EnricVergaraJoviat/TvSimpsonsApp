function pickLocalizedText(entity, baseKey, language) {
  if (!entity) return "";

  const langUpper = language === "es" ? "Es" : "En";
  const primaryKey = `${baseKey}${langUpper}`;
  const fallbackKey = language === "es" ? `${baseKey}En` : `${baseKey}Es`;

  return (
    entity[primaryKey] ||
    entity?.translations?.[language]?.[baseKey] ||
    entity[baseKey] ||
    entity[fallbackKey] ||
    ""
  );
}

export function localizeSimpsonsData(rawData, language) {
  if (!rawData?.seasons) return rawData;

  return {
    ...rawData,
    seasons: rawData.seasons.map((season) => ({
      ...season,
      title: pickLocalizedText(season, "title", language),
      episodes: (season.episodes || []).map((episode) => ({
        ...episode,
        title: pickLocalizedText(episode, "title", language),
        synopsis: pickLocalizedText(episode, "synopsis", language),
      })),
    })),
  };
}
