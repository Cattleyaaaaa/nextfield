/** Original site artwork for tracks without verified album art; never presented as an official sleeve. */
export function fieldRadioCover(title: string, artist: string) {
  const seed = Array.from(`${artist}:${title}`).reduce(
    (value, char) => (value * 33 + char.charCodeAt(0)) >>> 0,
    5381,
  );
  const hue = seed % 360;
  const secondHue = (hue + 52 + (seed % 44)) % 360;
  const escape = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  const safeTitle = escape(
    title.length > 18 ? `${title.slice(0, 17)}…` : title,
  );
  const safeArtist = escape(
    artist.length > 23 ? `${artist.slice(0, 22)}…` : artist,
  );
  const rings = Array.from(
    { length: 6 },
    (_, index) =>
      `<circle cx="300" cy="244" r="${44 + index * 42}" fill="none" stroke="white" stroke-opacity="${0.08 + index * 0.025}" stroke-width="2"/>`,
  ).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="hsl(${hue} 64% 35%)"/><stop offset="1" stop-color="hsl(${secondHue} 64% 13%)"/></linearGradient></defs><rect width="600" height="600" fill="url(#g)"/><path d="M0 398 Q160 246 300 338 T600 250 V600 H0Z" fill="white" fill-opacity=".07"/>${rings}<circle cx="300" cy="244" r="70" fill="white" fill-opacity=".09"/><circle cx="300" cy="244" r="16" fill="white" fill-opacity=".7"/><text x="42" y="56" fill="white" fill-opacity=".65" font-family="Arial,sans-serif" font-size="16" letter-spacing="6">FIELD RADIO / ORIGINAL ART</text><text x="42" y="485" fill="white" font-family="Arial,'Microsoft YaHei',sans-serif" font-size="37" font-weight="700">${safeTitle}</text><text x="44" y="530" fill="white" fill-opacity=".7" font-family="Arial,'Microsoft YaHei',sans-serif" font-size="21">${safeArtist}</text><text x="548" y="560" text-anchor="end" fill="white" fill-opacity=".45" font-family="Arial,sans-serif" font-size="16">NF / ${String(seed % 1000).padStart(3, "0")}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
