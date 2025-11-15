function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generateRandomColorPair(): { dark: string; light: string } {
  const hue = Math.floor(Math.random() * 360);
  // Saturation chosen to give pleasant colors
  const sat = 60;
  // Dark variant (for accents/backgrounds)
  const dark = hslToHex(hue, sat, 30);
  // Light variant (for background/text contrast)
  const light = hslToHex(hue, sat, 92);

  return { dark, light };
}

export default generateRandomColorPair;
