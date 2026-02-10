import React from "react";
import { View, Text, Image, Animated } from "react-native";
import { resolveAsset } from "../assets/imagesMap";

export default function SeasonHeader({
  season,
  maxHeaderH,
  translateY,
}) {
  const seasonImgSrc = resolveAsset(season?.image);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: maxHeaderH,
        transform: [{ translateY }],
        overflow: "hidden",
      }}
    >
      {/* Imagen full width */}
      <View style={{ flex: 1 }}>
        {seasonImgSrc ? (
          <Image
            source={seasonImgSrc}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: "#111",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff" }}>{season?.title || "Temporada"}</Text>
          </View>
        )}
      </View>

      {/* Caja de texto sobre la imagen */}
      <View
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
        }}
      >
        <View
          style={{
            alignSelf: "flex-start",
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 14,
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 26, fontWeight: "900" }}>
            {season?.title}
          </Text>
          <Text style={{ color: "#eaeaea", marginTop: 2, fontSize: 13 }}>
            {season?.episodes?.length ?? 0} capítulos
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
