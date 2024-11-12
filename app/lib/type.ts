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
