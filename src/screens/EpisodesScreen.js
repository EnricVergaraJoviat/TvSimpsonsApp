import React, { useMemo, useRef, useLayoutEffect, useCallback } from "react";
import {
  View,
  Text,
  StatusBar,
  Animated,
  Platform,
  Dimensions,
  Alert,
} from "react-native";

import data from "../data/simpsons";
import EpisodeRow from "../components/EpisodeRow";
import SeasonHeader from "../components/SeasonHeader";

const { height: SCREEN_H } = Dimensions.get("window");

// Ajusta a tu gusto
const MAX_HEADER_H = SCREEN_H * 0.52;
const MIN_HEADER_H = SCREEN_H * 0.15;
const GAP_BELOW_HEADER = 12;

// 👉 CAMBIA ESTO por la IP de tu Raspberry
const API_BASE_URL = "http://192.168.1.23:5050";

// Convierte el ID del JSON (ej: "7x01") a lo que espera la Raspberry (ej: "S07E01")
function toRaspberryEpisodeId(appEpisodeId) {
  // appEpisodeId típicamente: "7x01", "34x14", etc.
  const m = String(appEpisodeId).match(/^(\d+)\s*x\s*(\d+)$/i);
  if (!m) return null;

  const seasonNum = String(parseInt(m[1], 10)).padStart(2, "0");
  const episodeNum = String(parseInt(m[2], 10)).padStart(2, "0");

  return `S${seasonNum}E${episodeNum}`;
}

export default function EpisodesScreen({ route, navigation }) {
  const { seasonId } = route.params;

  useLayoutEffect(() => {
    navigation?.setOptions?.({ headerShown: false });
  }, [navigation]);

  const season = useMemo(
    () => data.seasons.find((s) => s.id === seasonId),
    [seasonId]
  );

  const scrollY = useRef(new Animated.Value(0)).current;

  const playEpisodeOnPi = useCallback(async (raspberryEpisodeId) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const res = await fetch(`${API_BASE_URL}/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: raspberryEpisodeId }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${txt}`);
      }

      // Si quieres, puedes leer JSON:
      // const json = await res.json();
      // console.log(json);
    } catch (err) {
      Alert.alert(
        "No se pudo reproducir",
        `Error llamando a ${API_BASE_URL}/play\n\n${String(err)}`
      );
    } finally {
      clearTimeout(timeout);
    }
  }, []);

  const onPressPlay = useCallback(
    async (item) => {
      const raspberryId = toRaspberryEpisodeId(item.id);
      if (!raspberryId) {
        Alert.alert(
          "ID inválido",
          `No puedo convertir el id "${item.id}" al formato SxxExx.`
        );
        return;
      }

      // Debug útil:
      // console.log("APP id:", item.id, "-> PI id:", raspberryId);

      await playEpisodeOnPi(raspberryId);
    },
    [playEpisodeOnPi]
  );

  if (!season) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text>No se encontró la temporada.</Text>
      </View>
    );
  }

  const bgColor = season.avgColor || "#111";
  const maxTranslate = MAX_HEADER_H - MIN_HEADER_H;

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, maxTranslate],
    outputRange: [0, -maxTranslate],
    extrapolate: "clamp",
  });

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar barStyle="light-content" />

      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.22)" }}>
        {/* LISTA */}
        <Animated.FlatList
          data={season.episodes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EpisodeRow item={item} onPlay={() => onPressPlay(item)} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
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

        {/* HEADER */}
        <SeasonHeader
          season={season}
          maxHeaderH={MAX_HEADER_H}
          translateY={headerTranslateY}
        />

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
    </View>
  );
}
