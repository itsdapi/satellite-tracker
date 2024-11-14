'use server'

import {eciToGeodetic, gstime, propagate, twoline2satrec} from "satellite.js";
import {memoize} from "nextjs-better-unstable-cache";
import {TleData} from "@/app/lib/type";
import {dateToUnixTimestampInSeconds, geoToCartesian, radiansToDegrees} from "@/app/lib/utils";

interface TleToScreenPositionOptions {
  earthRadius?: number,
  globeRadius?: number,
  numPoints?: number
}

// 0: x, 1: y, 2: z, 3: unix timestamp in seconds
export type SatellitePositionArray = [number, number, number, number]

// Array of SatellitePositionArray and satellite name
export type SatelliteOrbitData = {
  position: SatellitePositionArray[],
  name: string
};

export async function calculateBatchTlePositions(satBatch: TleData[], options: TleToScreenPositionOptions = {}): Promise<SatelliteOrbitData[]> {
  const promises = satBatch.map(async (sat) => {
    const positions = await tleToScreenPositionCached(sat.tle1, sat.tle2, options);
    return {
      name: sat.name,
      position: positions,
    } as SatelliteOrbitData;
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
    numPoints = 100
  } = options;

  const satrec = twoline2satrec(tle1, tle2);
  const dots = [];
  const period = 2 * Math.PI / satrec.no;
  const step = period / numPoints;

  const scaleFactor = globeRadius / earthRadius;

  const constantGmst = gstime(new Date());

  console.log('Calculating positions for', satrec.satnum, 'with', numPoints, 'points');
  for (let i = 0; i <= numPoints; i++) {
    const time = new Date();
    time.setMinutes(time.getMinutes() + i * step);

    const positionAndVelocity = propagate(satrec, time);
    const positionEci = positionAndVelocity.position;

    if (positionEci && typeof (positionEci) !== "boolean") {
      const positionGd = eciToGeodetic(positionEci, constantGmst);
      const height = positionGd.height * 1000;
      const longitude = radiansToDegrees(positionGd.longitude)
      const latitude = radiansToDegrees(positionGd.latitude)

      const radius = (earthRadius + height) * scaleFactor;
      const [x, y, z] = geoToCartesian(longitude, latitude, radius);
      dots.push([x, y, z, dateToUnixTimestampInSeconds(time)]);
    }
  }
  return dots as SatellitePositionArray[]
}
