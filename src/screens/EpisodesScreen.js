import React, { useMemo, useRef, useLayoutEffect } from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
} from "react-native";

import data from "../data/simpsons";
import { resolveAsset } from "../assets/imagesMap";

const { height: SCREEN_H } = Dimensions.get("window");

// Ajusta a tu gusto
const MAX_HEADER_H = SCREEN_H * 0.52;  // alto inicial
const MIN_HEADER_H = SCREEN_H * 0.15;  // alto mínimo visible
const GAP_BELOW_HEADER = 12;           // separación header -> primera celda

export default function EpisodesScreen({ route, navigation }) {
  const { seasonId } = route.params;

  useLayoutEffect(() => {
    // Oculta el header del navigation (título/backbar)
    navigation?.setOptions?.({ headerShown: false });
  }, [navigation]);

  const season = useMemo(
    () => data.seasons.find((s) => s.id === seasonId),
    [seasonId]
  );

  const scrollY = useRef(new Animated.Value(0)).current;

  if (!season) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text>No se encontró la temporada.</Text>
      </View>
    );
  }

  const seasonImgSrc = resolveAsset(season.image);

  // El header se desplaza hacia arriba como máximo (MAX - MIN)
  const maxTranslate = MAX_HEADER_H - MIN_HEADER_H;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, maxTranslate],
    outputRange: [0, -maxTranslate],
    extrapolate: "clamp",
  });

  const renderItem = ({ item }) => {
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
  };

  return (
    <ImageBackground
      source={require("../../assets/backgrounds/simpsons_clouds.jpg")}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" />

      {/* Overlay general */}
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.28)" }}>
        {/* LISTA */}
        <Animated.FlatList
          data={season.episodes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          // IMPORTANTÍSIMO: deja espacio para el header fijo + un gap
          contentContainerStyle={{
            paddingTop: MAX_HEADER_H + GAP_BELOW_HEADER,
            paddingHorizontal: 16,
            paddingBottom: 28,
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        />

        {/* HEADER (encima de la lista) */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: MAX_HEADER_H,
            transform: [{ translateY: headerTranslateY }],
            overflow: "hidden", // CLAVE: al subir, se recorta y queda el MIN_HEADER_H visible
          }}
        >
          {/* Imagen full width */}
          <View style={{ flex: 1 }}>
            {seasonImgSrc ? (
              <Image
                source={seasonImgSrc}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover" // llena el ancho; recorta si hace falta
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
                <Text style={{ color: "#fff" }}>{season.title}</Text>
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
                {season.title}
              </Text>
              <Text style={{ color: "#eaeaea", marginTop: 2, fontSize: 13 }}>
                {season.episodes.length} capítulos
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* “Safe area” mínimo arriba para iOS notch (sin libs) */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: Platform.OS === "ios" ? 12 : 0,
          }}
        />
      </View>
    </ImageBackground>
  );
}
