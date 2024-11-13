export interface Location {
  latitude: number,
  longitude: number,
  // in Kilometers
  height: number
}

export interface Pass {
  start: Date;
  end: Date;
  maxElevation: number;
}

export type TleData = {
  id: string,
  name: string,
  tle1: string,
  tle2: string
};
