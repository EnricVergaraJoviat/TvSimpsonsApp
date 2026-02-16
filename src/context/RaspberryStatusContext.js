import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getRaspberryHealth } from "../services/raspberryApi";

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

  const refreshHealth = useCallback(async () => {
    const data = await getRaspberryHealth();
    setHealth(data);
    return data;
  }, []);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const data = await getRaspberryHealth();
      if (mounted) setHealth(data);
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
    }),
    [health, refreshHealth]
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
