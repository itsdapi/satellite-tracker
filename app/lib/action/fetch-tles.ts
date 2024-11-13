import {TleData} from "@/app/lib/type";

export async function fetchTles(limit = 10): Promise<TleData[]> {
  const response = await fetch('https://unpkg.com/globe.gl/example/datasets/space-track-leo.txt');
  const rawData = await response.text();
  return rawData.replace(/\r/g, '')
    .split(/\n(?=[^12])/)
    .filter(d => d)
    .map((tle, index) => {
      const [name, tle1, tle2] = tle.split('\n');
      return {id: index.toString(), name, tle1, tle2} as TleData;
    })
    .slice(0, limit);
}
