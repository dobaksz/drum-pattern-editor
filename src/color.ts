const SATURATION_BOOST = 0.35;
const LIGHTNESS_FACTOR = 0.72;

export function getSymbolColor(hex: string): string {
  const value = hex.replace("#", "");
  const normalized = value.length === 3
    ? value.split("").map((channel) => channel + channel).join("")
    : value;
  const red = parseInt(normalized.slice(0, 2), 16) / 255;
  const green = parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = parseInt(normalized.slice(4, 6), 16) / 255;
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

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const section = hue / 60;
  const secondary = chroma * (1 - Math.abs((section % 2) - 1));
  const channels: Array<[number, number, number]> = [
    [chroma, secondary, 0],
    [secondary, chroma, 0],
    [0, chroma, secondary],
    [0, secondary, chroma],
    [secondary, 0, chroma],
    [chroma, 0, secondary]
  ];
  const [red, green, blue] = channels[Math.floor(section) % channels.length]!;
  const offset = lightness - chroma / 2;
  const hex = [red, green, blue]
    .map((channel) => Math.round((channel + offset) * 255).toString(16).padStart(2, "0"))
    .join("");
  return `#${hex}`;
}
