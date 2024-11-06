'use server'

import {eciToGeodetic, gstime, propagate, twoline2satrec} from "satellite.js";
import {dateToUnixTimestampInSeconds} from "@/app/lib/utils";
import {memoize} from "nextjs-better-unstable-cache";
import * as THREE from "three";

interface TleToScreenPositionOptions {
  earthRadius?: number,
  globeRadius?: number,
  scaleFactor?: number,
  numPoints?: number
}

// 0: x, 1: y, 2: z, 3: unix timestamp in seconds
export type SatellitePositionArray = [number, number, number, number]

// Array of SatellitePositionArray and satellite name
export type SatelliteData = [SatellitePositionArray[], string];

export async function calculateBatchTlePositions(tleBatch: TleData[], options: TleToScreenPositionOptions = {}): Promise<SatelliteData[]> {
  const promises = tleBatch.map(async ([name, tle1, tle2]) => {
    const positions = await tleToScreenPositionCached(tle1, tle2, options);
    return [positions, name] as SatelliteData;
  });
  return await Promise.all(promises);
}

export const tleToScreenPositionCached = memoize(
  tleToScreenPosition,
  {
    persist: true,
    duration: 3600,
    revalidateTags: (tle1: string, tle2: string, options: TleToScreenPositionOptions) => [tle1, tle2, JSON.stringify(options)],
    logid: 'tleToScreenPositionCached'
  }
)

export async function tleToScreenPosition(tle1: string, tle2: string, options: TleToScreenPositionOptions = {}) {
  const {
    earthRadius = 6371e3,
    globeRadius = 1,
    scaleFactor = globeRadius / earthRadius,
    numPoints = 100
  } = options;

  const satrec = twoline2satrec(tle1, tle2);
  const dots = [];
  const period = 2 * Math.PI / satrec.no;
  const step = period / numPoints;

  const constantGmst = gstime(new Date());

  const rotationMatrix = new THREE.Matrix4().makeRotationX(-Math.PI / 2);

  for (let i = 0; i <= numPoints; i++) {
    const time = new Date();
    time.setMinutes(time.getMinutes() + i * step);

    const positionAndVelocity = propagate(satrec, time);
    const positionEci = positionAndVelocity.position;

    if (positionEci && typeof (positionEci) !== "boolean") {
      const positionGd = eciToGeodetic(positionEci, constantGmst);
      const height = positionGd.height * 1000;

      const radius = (earthRadius + height) * scaleFactor;
      const x = radius * Math.cos(positionGd.latitude) * Math.cos(positionGd.longitude);
      const y = radius * Math.cos(positionGd.latitude) * Math.sin(positionGd.longitude);
      const z = radius * Math.sin(positionGd.latitude);

      const vector = new THREE.Vector3(x, y, z);
      vector.applyMatrix4(rotationMatrix);

      dots.push([vector.x, vector.y, vector.z, dateToUnixTimestampInSeconds(time)]);
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
