import {geoToCartesian} from "@/app/lib/utils";
import {Color} from "three";

export function TestPoint({location, color, radius}: { location: [number, number], color?: string, radius: number }) {

  return <mesh position={geoToCartesian(location[0], location[1], radius)} scale={0.3}>
    <sphereGeometry/>
    <meshBasicMaterial color={new Color(color)}/>
  </mesh>
}

export function TestPointXYZ({location, color, scale = 1}: {
  location: [number, number, number],
  color?: string,
  scale?: number
}) {

  return <mesh position={[location[0], location[1], location[2]]} scale={scale}>
    <sphereGeometry/>
    <meshBasicMaterial color={new Color(color)}/>
  </mesh>
}
