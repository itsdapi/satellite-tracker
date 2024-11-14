import {generateColor} from "@marko19907/string-to-color";
import {config} from "@/app.config";
import {CameraControls} from "@react-three/drei";
import * as THREE from "three";
import {Mesh, Vector3} from "three";

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

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

export function isValid(value: number | string | null | undefined): boolean {
  return value !== null && value !== undefined && value !== -1;
}

export function lookAtObject(cameraControls: CameraControls, object: Mesh, offset: [number, number, number] = [0, 0, 0]) {
  cameraControls.setLookAt(object.position.x + offset[0], object.position.y + offset[1], object.position.z + offset[2], 0, 0, 0, true).then()
}

type lookAtSatelliteOption = {
  // [phiAngle, thetaAngle, extendHeight]
  offset?: [number, number, number]
  earthCenter?: [number, number, number]
}

export function lookAtSatellite(
  cameraControls: CameraControls,
  satellite: Mesh,
  options: lookAtSatelliteOption = {}
) {
  const {earthCenter = [0, 0, 0], offset = [0, 0, 0]} = options;

  const earthCenterVector = new Vector3(...earthCenter);
  const satVector = new Vector3().subVectors(satellite.position, earthCenterVector).normalize();
  const length = offset[2]; // Assuming length is defined somewhere
  const extendedVector = satVector.clone().multiplyScalar(length);

  const phi = offset[0] * degreesToRadians(1);
  const theta = offset[1] * degreesToRadians(1);
  const rotationMatrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(phi, theta, 0));
  extendedVector.applyMatrix4(rotationMatrix);

  cameraControls.setPosition(extendedVector.x, extendedVector.y, extendedVector.z, true).then();
}

export function geoToCartesian(
  longitude: number,
  latitude: number,
  radius: number = 1
): [number, number, number] {
  const phi = longitude * (Math.PI / 180);
  const theta = (90 - latitude) * (Math.PI / 180);

  const x = -radius * Math.sin(theta) * Math.cos(phi);
  const y = radius * Math.cos(theta);
  const z = radius * Math.sin(theta) * Math.sin(phi);

  return [x, y, z];
}

interface SunAngleToPositionOptionProps {
  tilt?: number;
  radius?: number;
}

export function sunAngleToPosition(angle: number, options: SunAngleToPositionOptionProps = {}): [number, number, number] {
  const {tilt = 23.5, radius = 10} = options

  const tiltRad = degreesToRadians(tilt);
  return [
    Math.cos(angle) * radius,
    Math.sin(tiltRad) * Math.sin(angle) * radius,
    Math.cos(tiltRad) * Math.sin(angle) * radius
  ];
}

export function nowToSunAngle(now: number): number {
  const time = new Date(now);
  const hours = time.getUTCHours();
  const minutes = time.getUTCMinutes();
  const seconds = time.getUTCSeconds();

  const dayTime = hours * 3600 + minutes * 60 + seconds;
  const dayLength = 24 * 3600;

  return (dayTime / dayLength) * Math.PI * 2;
}

