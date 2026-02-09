import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  ImageBackground,
  Dimensions,
  StatusBar,
} from "react-native";

import data from "../data/simpsons";
import { resolveAsset } from "../assets/imagesMap";

const NUM_COLUMNS = 2;
const GAP = 14;
const H_PADDING = 16;

export default function SeasonsScreen({ navigation }) {
  const seasons = data.seasons;

  const screenWidth = Dimensions.get("window").width;
  const itemWidth =
    (screenWidth - H_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

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
        {/* Imagen */}
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
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 14, // 👈 rounded en la imagen
              }}
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
              <Text style={{ color: "#bbb", fontSize: 12 }}>No img</Text>
            </View>
          )}
        </View>

        {/* Texto */}
        <View style={{ padding: 12 }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "700",
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text
            style={{
              color: "#e0e0e0",
              marginTop: 4,
              fontSize: 12,
            }}
          >
            {item.episodes.length} capítulos
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

      {/* Overlay oscuro para contraste */}
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: H_PADDING,
            paddingTop: 20,
            paddingBottom: 12,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 28,
              fontWeight: "800",
            }}
          >
            Los Simpson
          </Text>
          <Text style={{ color: "#f1f1f1", marginTop: 6 }}>
            Temporadas
          </Text>
        </View>

        <FlatList
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
        />
      </View>
    </ImageBackground>
  );
}
