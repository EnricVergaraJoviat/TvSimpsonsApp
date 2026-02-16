export const RASPBERRY_API_BASE_URL = "http://10.1.35.27:5050";

export async function getRaspberryHealth({ timeoutMs = 3500 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${RASPBERRY_API_BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });

    const bodyText = await res.text();
    let json = null;
    try {
      json = JSON.parse(bodyText);
    } catch (_err) {
      return {
        status: "yellow",
        ok: false,
        running: false,
        playing: null,
        ts: null,
        error: "invalid_json",
      };
    }

    const isOk = res.ok && json?.ok === true;
    return {
      status: isOk ? "green" : "yellow",
      ok: json?.ok === true,
      running: Boolean(json?.running),
      playing: json?.playing ?? null,
      ts: json?.ts ?? null,
      error: null,
    };
  } catch (_err) {
    return {
      status: "red",
      ok: false,
      running: false,
      playing: null,
      ts: null,
      error: "request_failed",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function getRaspberryHealthStatus({ timeoutMs = 3500 } = {}) {
  const health = await getRaspberryHealth({ timeoutMs });
  return health.status;
}

export async function stopRaspberryPlayback({ timeoutMs = 5000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let res = await fetch(`${RASPBERRY_API_BASE_URL}/stop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });

    // Fallback por si el backend usa GET para stop.
    if (!res.ok && (res.status === 404 || res.status === 405)) {
      res = await fetch(`${RASPBERRY_API_BASE_URL}/stop`, {
        method: "GET",
        signal: controller.signal,
      });
    }

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${txt}`);
    }

    const txt = await res.text().catch(() => "");
    if (!txt) return { ok: true };
    try {
      return JSON.parse(txt);
    } catch (_err) {
      return { ok: true, raw: txt };
    }
  } finally {
    clearTimeout(timeout);
  }
}
