import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getRaspberryBaseUrl,
  getRaspberryHealth,
  setRaspberryBaseUrl,
} from "../services/raspberryApi";

const RaspberryStatusContext = createContext(null);

const INITIAL_HEALTH = {
  status: "red",
  ok: false,
  running: false,
  playing: null,
  ts: null,
  error: null,
};

export function RaspberryStatusProvider({ children }) {
  const [health, setHealth] = useState(INITIAL_HEALTH);
  const [baseUrl, setBaseUrl] = useState(null);

  const refreshHealth = useCallback(async () => {
    const data = await getRaspberryHealth();
    setHealth(data);
    setBaseUrl(data?.baseUrl ?? null);
    return data;
  }, []);

  const updateBaseUrl = useCallback(
    async (nextUrl) => {
      const normalized = await setRaspberryBaseUrl(nextUrl);
      setBaseUrl(normalized);
      await refreshHealth();
      return normalized;
    },
    [refreshHealth]
  );

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const currentBaseUrl = await getRaspberryBaseUrl();
      const data = await getRaspberryHealth();
      if (mounted) {
        setBaseUrl(currentBaseUrl);
        setHealth(data);
      }
    };

    run();
    const intervalId = setInterval(run, 10000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const value = useMemo(
    () => ({
      health,
      refreshHealth,
      baseUrl,
      updateBaseUrl,
    }),
    [health, refreshHealth, baseUrl, updateBaseUrl]
  );

  return (
    <RaspberryStatusContext.Provider value={value}>
      {children}
    </RaspberryStatusContext.Provider>
  );
}

export function useRaspberryStatus() {
  const ctx = useContext(RaspberryStatusContext);
  if (!ctx) {
    throw new Error("useRaspberryStatus must be used inside RaspberryStatusProvider");
  }
  return ctx;
}
