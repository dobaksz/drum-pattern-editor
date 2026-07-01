const SATURATION_BOOST = 0.35;
const LIGHTNESS_FACTOR = 0.72;

export function getSymbolColor(hex) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3
    ? value.split("").map((channel) => channel + channel).join("")
    : value;
  const [red, green, blue] = [0, 2, 4].map((index) => parseInt(normalized.slice(index, index + 2), 16) / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let lightness = (max + min) / 2;
  const difference = max - min;

  let hue = 0;
  let saturation = 0;
  if (difference !== 0) {
    saturation = difference / (1 - Math.abs(2 * lightness - 1));
    if (max === red) hue = 60 * (((green - blue) / difference) % 6);
    else if (max === green) hue = 60 * ((blue - red) / difference + 2);
    else hue = 60 * ((red - green) / difference + 4);
  }

  if (hue < 0) hue += 360;
  if (saturation > 0) saturation += (1 - saturation) * SATURATION_BOOST;
  lightness *= LIGHTNESS_FACTOR;
  return hslToHex(hue, saturation, lightness);
}

function hslToHex(hue, saturation, lightness) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const section = hue / 60;
  const secondary = chroma * (1 - Math.abs((section % 2) - 1));
  const [red, green, blue] = section < 1 ? [chroma, secondary, 0]
    : section < 2 ? [secondary, chroma, 0]
      : section < 3 ? [0, chroma, secondary]
        : section < 4 ? [0, secondary, chroma]
          : section < 5 ? [secondary, 0, chroma]
            : [chroma, 0, secondary];
  const offset = lightness - chroma / 2;
  const hex = [red, green, blue]
    .map((channel) => Math.round((channel + offset) * 255).toString(16).padStart(2, "0"))
    .join("");
  return `#${hex}`;
}
