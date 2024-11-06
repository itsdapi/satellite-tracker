'use server'

import {eciToGeodetic, gstime, propagate, twoline2satrec} from "satellite.js";
import {dateToUnixTimestampInSeconds} from "@/app/lib/utils";
import {memoize} from "nextjs-better-unstable-cache";

// 0: latitude, 1: longitude, 2: height, 3: unix timestamp in seconds
export type SatellitePositionArray = [number, number, number, number]

// Array of SatellitePositionArray and satellite name
export type SatelliteData = [SatellitePositionArray[], string];

export async function calculateBatchTlePositions(tleBatch: TleData[], numPoints: number = 100): Promise<SatelliteData[]> {
  const promises = tleBatch.map(async ([name, tle1, tle2]) => {
    const positions = await TleToCoordCached(tle1, tle2, numPoints);
    return [positions, name] as SatelliteData;
  });
  return await Promise.all(promises);
}

export const TleToCoordCached = memoize(
  TleToCoord,
  {
    persist: true,
    duration: 3600,
    revalidateTags: (tle1: string, tle2: string, numPoints: number) => [tle1, tle2, numPoints.toString()],
    logid: 'TleToCoordCached'
  }
)

export async function TleToCoord(tle1: string, tle2: string, numPoints: number = 100) {
  const satrec = twoline2satrec(tle1, tle2);
  const dots = [];
  const period = 2 * Math.PI / satrec.no;
  const step = period / numPoints;

  const constantGmst = gstime(new Date());

  for (let i = 0; i <= numPoints; i++) {
    const time = new Date();
    time.setMinutes(time.getMinutes() + i * step);

    const positionAndVelocity = propagate(satrec, time);
    const positionEci = positionAndVelocity.position;

    if (positionEci && typeof (positionEci) !== "boolean") {
      const positionGd = eciToGeodetic(positionEci, constantGmst);
      const height = positionGd.height * 1000;

      const latitude = positionGd.latitude * (180 / Math.PI); // Convert radians to degrees
      const longitude = positionGd.longitude * (180 / Math.PI); // Convert radians to degrees

      dots.push([latitude, longitude, height / 6371, dateToUnixTimestampInSeconds(time)]);
    }
  }
  return dots as SatellitePositionArray[]
}

export type TleData = [string, string, string];

export async function fetchTles(limit = 10) {
  const response = await fetch('https://unpkg.com/globe.gl/example/datasets/space-track-leo.txt');
  const rawData = await response.text();
  const tleData = rawData.replace(/\r/g, '')
    .split(/\n(?=[^12])/)
    .filter(d => d)
    .map(tle => tle.split('\n'))
    .slice(0, limit);
  return tleData as TleData[];
}
