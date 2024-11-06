import {generateColor} from "@marko19907/string-to-color";
import {config} from "@/app.config";

export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

export function dateToUnixTimestampInSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export function stringToHexColor(str: string): string {
  const hslString = generateColor(str, config.colorOptions);
  const hslValue = hslString.match(/\d+/g)?.map(Number);
  if (!hslValue) throw new Error("Invalid HSL format");

  const [h, s, l] = hslValue;
  return hslToHex(h, s, l);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

  const r = Math.round(255 * f(0));
  const g = Math.round(255 * f(8));
  const b = Math.round(255 * f(4));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
