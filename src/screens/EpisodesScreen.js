import React, { useMemo, useRef, useLayoutEffect } from "react";
import {
  View,
  Text,
  StatusBar,
  Animated,
  Platform,
  Dimensions,
} from "react-native";

import data from "../data/simpsons";
import EpisodeRow from "../components/EpisodeRow";
import SeasonHeader from "../components/SeasonHeader";

const { height: SCREEN_H } = Dimensions.get("window");

// Ajusta a tu gusto
const MAX_HEADER_H = SCREEN_H * 0.52;
const MIN_HEADER_H = SCREEN_H * 0.15;
const GAP_BELOW_HEADER = 12;

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
          renderItem={({ item }) => <EpisodeRow item={item} />}
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
