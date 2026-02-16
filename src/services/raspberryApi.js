export const RASPBERRY_API_BASE_URL = "http://10.1.35.27:5050";

export async function getRaspberryHealthStatus({ timeoutMs = 3500 } = {}) {
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
      // Hubo respuesta pero no JSON válido -> estado degradado.
      return "yellow";
    }

    if (res.ok && json?.ok === true) return "green";
    return "yellow";
  } catch (_err) {
    // Sin respuesta / timeout / red.
    return "red";
  } finally {
    clearTimeout(timeout);
  }
}
