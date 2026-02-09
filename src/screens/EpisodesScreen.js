import React, { useMemo } from "react";
import { View, Text, FlatList, Image } from "react-native";

import data from "../data/simpsons";
import { resolveAsset } from "../assets/imagesMap";

export default function EpisodesScreen({ route }) {
  const { seasonId } = route.params;

  const season = useMemo(
    () => data.seasons.find((s) => s.id === seasonId),
    [seasonId]
  );

  if (!season) {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text>No se encontró la temporada.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>{season.title}</Text>

      <FlatList
        data={season.episodes}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => {
          const imgSrc = resolveAsset(item.image);

          return (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                borderWidth: 1,
                borderRadius: 12,
              }}
            >
              {imgSrc ? (
                <Image
                  source={imgSrc}
                  style={{ width: 96, height: 54, borderRadius: 10, marginRight: 12 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: 96,
                    height: 54,
                    borderRadius: 10,
                    borderWidth: 1,
                    marginRight: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 12 }}>No img</Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16 }}>
                  {item.episodeNumber}. {item.title}
                </Text>

                <Text style={{ opacity: 0.7, marginTop: 4 }}>
                  Duración: {item.duration} · Emisión: {item.airDate}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
