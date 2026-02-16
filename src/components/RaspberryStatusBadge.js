import React, { useCallback, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, Pressable, Modal, Animated, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { stopRaspberryPlayback } from "../services/raspberryApi";
import { useRaspberryStatus } from "../context/RaspberryStatusContext";

function statusColor(status) {
  if (status === "green") return "#22c55e";
  if (status === "yellow") return "#facc15";
  return "#ef4444";
}

export default function RaspberryStatusBadge({ strings, style }) {
  const { health, refreshHealth, baseUrl, updateBaseUrl } = useRaspberryStatus();
  const insets = useSafeAreaInsets();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [visible, setVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scannerLocked, setScannerLocked] = useState(false);
  const scannerLockRef = useRef(false);
  const [stopping, setStopping] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const openModal = useCallback(() => {
    setVisible(true);
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const closeModal = useCallback(() => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setVisible(false);
    });
  }, [anim]);

  const onStop = useCallback(async () => {
    setStopping(true);
    try {
      await stopRaspberryPlayback();
      await refreshHealth();
    } catch (err) {
      Alert.alert(
        strings?.rpiStopErrorTitle || "Stop failed",
        String(err)
      );
    } finally {
      setStopping(false);
    }
  }, [refreshHealth, strings?.rpiStopErrorTitle]);

  const openScanner = useCallback(async () => {
    const current = cameraPermission?.granted;
    if (!current) {
      const req = await requestCameraPermission();
      if (!req?.granted) {
        Alert.alert(
          strings?.rpiQrPermissionTitle || "Camera permission required",
          strings?.rpiQrPermissionMessage || "Allow camera access to scan the Raspberry QR."
        );
        return;
      }
    }

    // iOS falla a veces al presentar un Modal encima de otro.
    // Cerramos primero el modal de estado y luego abrimos el escáner.
    Animated.timing(anim, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setScannerLocked(false);
      scannerLockRef.current = false;
      setScannerVisible(true);
    });
  }, [
    anim,
    cameraPermission?.granted,
    requestCameraPermission,
    strings?.rpiQrPermissionMessage,
    strings?.rpiQrPermissionTitle,
  ]);

  const closeScanner = useCallback(() => {
    setScannerVisible(false);
    setScannerLocked(false);
    scannerLockRef.current = false;
  }, []);

  const onScanQr = useCallback(
    async ({ data }) => {
      if (scannerLockRef.current) return;
      scannerLockRef.current = true;
      setScannerLocked(true);

      try {
        const normalized = await updateBaseUrl(data);
        closeScanner();
        Alert.alert(
          strings?.rpiQrSavedTitle || "Raspberry updated",
          `${strings?.rpiBaseUrlLabel || "URL"}: ${normalized}`
        );
      } catch (_err) {
        scannerLockRef.current = false;
        setScannerLocked(false);
        Alert.alert(
          strings?.rpiQrInvalidTitle || "Invalid QR",
          strings?.rpiQrInvalidMessage || "The QR must contain a valid URL like http://10.1.35.27:5050"
        );
      }
    },
    [
      closeScanner,
      strings?.rpiBaseUrlLabel,
      strings?.rpiQrInvalidMessage,
      strings?.rpiQrInvalidTitle,
      strings?.rpiQrSavedTitle,
      updateBaseUrl,
    ]
  );

  const cardTranslateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  const cardOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const stateLabel =
    health.error === "not_configured"
      ? strings?.rpiNotConfigured || "Not configured"
      :
    health.status === "green"
      ? strings?.rpiConnected || "Connected"
      : health.status === "yellow"
      ? strings?.rpiDegraded || "Degraded"
      : strings?.rpiDisconnected || "Disconnected";

  return (
    <>
      <Pressable
        onPress={openModal}
        style={[
          {
            position: "absolute",
            top: insets.top + 0,
            right: 16,
            zIndex: 30,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 999,
            backgroundColor: "rgba(0,0,0,0.45)",
          },
          style,
        ]}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: statusColor(health.status),
          }}
        />
        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
          RPi
        </Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="none" onRequestClose={closeModal}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Pressable
            onPress={closeModal}
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
              width: "90%",
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.95)",
              padding: 16,
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }],
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "#111", fontSize: 20, fontWeight: "900" }}>
                Raspberry Pi
              </Text>
              <Pressable onPress={closeModal}>
                <Text style={{ color: "#111", fontSize: 22, fontWeight: "800" }}>×</Text>
              </Pressable>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: statusColor(health.status),
                  marginRight: 8,
                }}
              />
              <Text style={{ color: "#111", fontSize: 15, fontWeight: "700" }}>
                {stateLabel}
              </Text>
            </View>

            <Text style={{ color: "#111", fontSize: 14, marginBottom: 6 }}>
              {strings?.rpiOkLabel || "ok"}: {health.ok ? "true" : "false"}
            </Text>
            <Text style={{ color: "#111", fontSize: 14, marginBottom: 6 }}>
              {strings?.rpiRunningLabel || "running"}: {health.running ? "true" : "false"}
            </Text>
            <Text style={{ color: "#111", fontSize: 14, marginBottom: 14 }}>
              {strings?.rpiPlayingLabel || "playing"}: {health.playing || "-"}
            </Text>
            <Text style={{ color: "#111", fontSize: 13, marginBottom: 14 }}>
              {strings?.rpiBaseUrlLabel || "URL"}: {baseUrl || strings?.rpiUnknown || "unknown"}
            </Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={openScanner}
                style={({ pressed }) => ({
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(0,0,0,0.08)",
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ color: "#111", fontWeight: "700" }}>
                  {strings?.rpiScanQr || "Scan QR"}
                </Text>
              </Pressable>

              <Pressable
                disabled={stopping || (!health.running && !health.playing)}
                onPress={onStop}
                style={({ pressed }) => ({
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#111",
                  opacity:
                    stopping || (!health.running && !health.playing)
                      ? 0.45
                      : pressed
                      ? 0.85
                      : 1,
                })}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>
                  {stopping
                    ? strings?.rpiStopping || "Stopping..."
                    : strings?.rpiStop || "Stop"}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Modal
        visible={scannerVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeScanner}
      >
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={scannerLocked ? undefined : onScanQr}
          />

          <View
            style={{
              position: "absolute",
              top: insets.top + 14,
              left: 16,
              right: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>
              {strings?.rpiScanQr || "Scan QR"}
            </Text>
            <Pressable
              onPress={closeScanner}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900" }}>×</Text>
            </Pressable>
          </View>

          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: insets.bottom + 22,
              left: 24,
              right: 24,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                textAlign: "center",
                backgroundColor: "rgba(0,0,0,0.45)",
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 10,
              }}
            >
              {strings?.rpiQrHint || "Scan a QR containing a Raspberry URL like http://10.1.35.27:5050"}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}
