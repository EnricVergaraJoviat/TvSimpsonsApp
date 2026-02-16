import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ImageBackground,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";

import rawData from "../data/simpsons";
import { localizeSimpsonsData } from "../data/localizeSimpsonsData";
import { resolveAsset } from "../assets/imagesMap";
import { getDeviceLanguage, getStrings } from "../i18n";
import { getRaspberryHealthStatus } from "../services/raspberryApi";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const NUM_COLUMNS = 2;
const GAP = 14;
const H_PADDING = 16;

// Header “10% -> 5%” (aprox)
const MAX_HEADER_H = SCREEN_H * 0.2;
const MIN_HEADER_H = SCREEN_H * 0.1;

// Cuánto scroll hace falta para completar la animación
const COLLAPSE_DISTANCE = 180;

export default function SeasonsScreen({ navigation }) {
  const language = getDeviceLanguage();
  const strings = getStrings(language);
  const localizedData = useMemo(
    () => localizeSimpsonsData(rawData, language),
    [language]
  );
  const seasons = localizedData.seasons;
  const [raspberryStatus, setRaspberryStatus] = useState("red");

  const itemWidth = useMemo(() => {
    return (SCREEN_W - H_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
  }, []);

  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;

    const checkHealth = async () => {
      const status = await getRaspberryHealthStatus();
      if (mounted) setRaspberryStatus(status);
    };

    checkHealth();
    const intervalId = setInterval(checkHealth, 10000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [MAX_HEADER_H, MIN_HEADER_H],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE * 0.8, COLLAPSE_DISTANCE],
    outputRange: [1, 0.75, 0.4],
    extrapolate: "clamp",
  });

  const logoScale = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [1, 0.85],
    extrapolate: "clamp",
  });

  const renderItem = ({ item }) => {
    const imgSrc = resolveAsset(item.image);

    return (
      <Pressable
        onPress={() => navigation.navigate("Episodes", { seasonId: item.id })}
        style={({ pressed }) => ({
          width: itemWidth,
          borderRadius: 20,
          overflow: "hidden",
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: pressed ? 0.9 : 1,
          backgroundColor: "rgba(0,0,0,0.55)",
        })}
      >
        {/* Imagen temporada */}
        <View
          style={{
            width: "100%",
            aspectRatio: 1,
            padding: 10,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        >
          {imgSrc ? (
            <Image
              source={imgSrc}
              style={{ width: "100%", height: "100%", borderRadius: 14 }}
              resizeMode="contain"
            />
          ) : (
            <View
              style={{
                flex: 1,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#222",
              }}
            >
              <Text style={{ color: "#bbb", fontSize: 12 }}>
                {strings.noImage}
              </Text>
            </View>
          )}
        </View>

        {/* Texto */}
        <View style={{ padding: 12 }}>
          <Text
            style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={{ color: "#e0e0e0", marginTop: 4, fontSize: 12 }}>
            {item.episodes.length} {strings.episodes}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <ImageBackground
      source={require("../../assets/backgrounds/simpsons_clouds.jpg")}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" />

      {/* Overlay para contraste */}
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            zIndex: 30,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 999,
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor:
                raspberryStatus === "green"
                  ? "#22c55e"
                  : raspberryStatus === "yellow"
                  ? "#facc15"
                  : "#ef4444",
            }}
          />
          <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
            RPi
          </Text>
        </View>

        {/* Header animado */}
        <Animated.View
          style={{
            height: headerHeight,
            opacity: headerOpacity,
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 10,
          }}
        >
          <Animated.Image
            source={require("../../assets/logos/logo_simpsons.png")}
            resizeMode="contain"
            style={{
              width: "82%",
              height: "80%",
              transform: [{ scale: logoScale }],
            }}
          />
        </Animated.View>

        {/* Lista animada (para capturar el scrollY) */}
        <Animated.FlatList
          contentContainerStyle={{
            paddingHorizontal: H_PADDING,
            paddingBottom: 24,
          }}
          data={seasons}
          keyExtractor={(item) => String(item.id)}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={{ gap: GAP, marginBottom: GAP }}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false } // height no puede con native driver
          )}
        />
      </View>
    </ImageBackground>
  );
}
