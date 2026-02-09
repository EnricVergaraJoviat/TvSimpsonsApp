import React from "react";
import { View, Text, FlatList, Pressable, Image } from "react-native";

import data from "../data/simpsons";
import { resolveAsset } from "../assets/imagesMap";

export default function SeasonsScreen({ navigation }) {
  const seasons = data.seasons;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={seasons}
        keyExtractor={(item) => String(item.id)}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          const imgSrc = resolveAsset(item.image);

          return (
            <Pressable
              onPress={() => navigation.navigate("Episodes", { seasonId: item.id })}
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
                  style={{ width: 72, height: 72, borderRadius: 12, marginRight: 12 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 12,
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
                <Text style={{ fontSize: 18 }}>{item.title}</Text>
                <Text style={{ opacity: 0.7, marginTop: 4 }}>
                  {item.episodes.length} capítulos
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
