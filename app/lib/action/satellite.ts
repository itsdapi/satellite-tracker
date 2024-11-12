'use server'

import {eciToGeodetic, gstime, propagate, twoline2satrec} from "satellite.js";
import {dateToUnixTimestampInSeconds, degreesToRadians, radiansToDegrees} from "@/app/lib/utils";
import {memoize} from "nextjs-better-unstable-cache";
import * as THREE from "three";
import {Pass, Location} from "@/app/lib/type";

interface TleToScreenPositionOptions {
  earthRadius?: number,
  globeRadius?: number,
  scaleFactor?: number,
  numPoints?: number
}

// 0: x, 1: y, 2: z, 3: unix timestamp in seconds
export type SatellitePositionArray = [number, number, number, number]

// Array of SatellitePositionArray and satellite name
export type SatelliteData = {
  position: SatellitePositionArray[],
  name: string
};

export async function calculateBatchTlePositions(tleBatch: TleData[], options: TleToScreenPositionOptions = {}): Promise<SatelliteData[]> {
  const promises = tleBatch.map(async ([name, tle1, tle2]) => {
    const positions = await tleToScreenPositionCached(tle1, tle2, options);
    return {
      name,
      position: positions,
    } as SatelliteData;
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

// 0: Satellite Name, 1: TLE Line 1, 2: TLE Line 2
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

interface SatellitePasses {
  name: string;
  passes: Pass[];
}

function calculateLookAngles(observer: Location, positionEci: { x: number, y: number, z: number }) {
  const observerGd = {
    longitude: degreesToRadians(observer.longitude),
    latitude: degreesToRadians(observer.latitude),
    height: observer.height
  };

  const observerEci = {
    x: (observerGd.height + 6371) * Math.cos(observerGd.latitude) * Math.cos(observerGd.longitude),
    y: (observerGd.height + 6371) * Math.cos(observerGd.latitude) * Math.sin(observerGd.longitude),
    z: (observerGd.height + 6371) * Math.sin(observerGd.latitude)
  };

  const rx = positionEci.x - observerEci.x;
  const ry = positionEci.y - observerEci.y;
  const rz = positionEci.z - observerEci.z;

  const range = Math.sqrt(rx * rx + ry * ry + rz * rz);

  const topocentric = {
    x: Math.cos(observerGd.latitude) * Math.cos(observerGd.longitude) * rx +
      Math.cos(observerGd.latitude) * Math.sin(observerGd.longitude) * ry +
      Math.sin(observerGd.latitude) * rz,
    y: -Math.sin(observerGd.longitude) * rx + Math.cos(observerGd.longitude) * ry,
    z: -Math.sin(observerGd.latitude) * Math.cos(observerGd.longitude) * rx -
      Math.sin(observerGd.latitude) * Math.sin(observerGd.longitude) * ry +
      Math.cos(observerGd.latitude) * rz
  };

  const elevation = radiansToDegrees(Math.asin(topocentric.z / range));
  const azimuth = radiansToDegrees(Math.atan2(-topocentric.y, topocentric.x));

  return {azimuth, elevation, range};
}

export async function calculateBatchSatellitePasses(tleBatch: TleData[], observer: Location): Promise<SatellitePasses[]> {
  const promises = tleBatch.map(async ([name, tle1, tle2]) => {
    const passes = await calculateSatellitePassesCached(tle1, tle2, observer);
    return {
      name,
      passes,
    } as SatellitePasses;
  });
  return await Promise.all(promises);
}


export const calculateSatellitePassesCached = memoize(
  calculateSatellitePasses,
  {
    persist: true,
    duration: 3600,
    // log: ['verbose', 'datacache'],
    revalidateTags: (tle1: string, tle2: string, observer: Location) => [tle1, tle2, JSON.stringify(observer)],
    logid: 'calculateSatellitePassesCached'
  }
);

export async function calculateSatellitePasses(tle1: string, tle2: string, observer: Location) {
  const satrec = twoline2satrec(tle1, tle2);
  const passes: Pass[] = [];
  const startTime = new Date();
  startTime.setUTCHours(0, 0, 0, 0); // Start from midnight UTC
  const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours later

  const currentTime = new Date(startTime);
  let isAboveHorizon = false;
  let passStart: Date | null = null;
  let maxElevation = -Infinity;

  while (currentTime < endTime) {
    const positionAndVelocity = propagate(satrec, currentTime);
    const positionEci = positionAndVelocity.position;

    if (positionEci && typeof positionEci !== 'boolean') {
      const lookAngles = calculateLookAngles(observer, positionEci);
      const elevation = lookAngles.elevation;

      if (elevation > 0) {
        if (!isAboveHorizon) {
          isAboveHorizon = true;
          passStart = new Date(currentTime);
          maxElevation = elevation;
        } else {
          maxElevation = Math.max(maxElevation, elevation);
        }
      } else {
        if (isAboveHorizon) {
          isAboveHorizon = false;
          if (passStart) {
            passes.push({start: passStart, end: new Date(currentTime), maxElevation});
            passStart = null;
            maxElevation = -Infinity;
          }
        }
      }
    }

    currentTime.setMinutes(currentTime.getMinutes() + 1); // Increment by 1 minute
  }

  return passes as Pass[];
}
