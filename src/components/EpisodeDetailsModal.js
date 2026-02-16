import React from "react";
import { Modal, View, Text, Pressable, Animated, ScrollView, Image } from "react-native";
import { resolveAsset } from "../assets/imagesMap";
import { formatSeasonTitle } from "../i18n";

export default function EpisodeDetailsModal({
  visible,
  episode,
  seasonNumber,
  strings,
  onClose,
  onPlay,
  cardOpacity,
  cardTranslateY,
  cardScale,
}) {
  const episodeImg = episode ? resolveAsset(episode.image) : null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={onClose}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
        />

        <Animated.View
          style={{
            width: "92%",
            height: "84%",
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: "rgba(255,255,255,0.90)",
            opacity: cardOpacity,
            transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
          }}
        >
          <View
            style={{
              paddingVertical: 12,
              paddingHorizontal: 14,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#111", fontSize: 24, fontWeight: "900" }}>
              {formatSeasonTitle(seasonNumber, strings)}
            </Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.08)",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: "#111", fontSize: 20, fontWeight: "700" }}>×</Text>
            </Pressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 18,
            }}
            showsVerticalScrollIndicator={false}
          >
            {episode && (
              <>
                {episodeImg ? (
                  <Image
                    source={episodeImg}
                    style={{
                      width: "100%",
                      height: 190,
                      borderRadius: 12,
                      marginBottom: 14,
                    }}
                    resizeMode="cover"
                  />
                ) : null}

                <Text
                  style={{
                    color: "#121212",
                    fontSize: 24,
                    fontWeight: "900",
                    lineHeight: 28,
                  }}
                >
                  {episode.episodeNumber}. {episode.title}
                </Text>

                <Text style={{ color: "#222", fontSize: 15, marginTop: 10 }}>
                  {strings?.duration || "Duration"}: {episode.duration}
                </Text>
                <Text style={{ color: "#222", fontSize: 15, marginTop: 2 }}>
                  {strings?.airDate || "Aired"}: {episode.airDate}
                </Text>

                <Text
                  style={{
                    color: "#151515",
                    fontSize: 16,
                    marginTop: 14,
                    lineHeight: 23,
                  }}
                >
                  {episode.synopsis || strings?.noSynopsis || "Synopsis not available."}
                </Text>
              </>
            )}
          </ScrollView>

          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Pressable
              disabled={!episode}
              onPress={() => episode && onPlay(episode)}
              style={({ pressed }) => ({
                height: 52,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#111",
                opacity: pressed ? 0.86 : 1,
              })}
            >
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "800" }}>
                {strings?.playOnRaspberry || "▶ Play on Raspberry"}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
