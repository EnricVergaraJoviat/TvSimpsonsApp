import React from "react";
import { View, Text, Image } from "react-native";
import { resolveAsset } from "../assets/imagesMap";

export default function EpisodeRow({ item }) {
  const imgSrc = resolveAsset(item.image);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 14,
        backgroundColor: "rgba(0,0,0,0.55)",
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
            marginRight: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#222",
          }}
        >
          <Text style={{ color: "#bbb", fontSize: 12 }}>No img</Text>
        </View>
      )}

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, color: "#fff", fontWeight: "700" }}>
          {item.episodeNumber}. {item.title}
        </Text>

        <Text style={{ opacity: 0.85, marginTop: 4, color: "#e6e6e6" }}>
          Duración: {item.duration} · Emisión: {item.airDate}
        </Text>
      </View>
    </View>
  );
}
