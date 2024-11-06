import {SatellitePositionArray} from "@/app/lib/action/satellite";
import {useRef} from "react";
import * as THREE from "three";
import {useFrame} from "@react-three/fiber";

export function Satellite({positions}: { positions: SatellitePositionArray[] }) {
  const satelliteRef = useRef<THREE.Mesh>(null);
  const elapsedTimeRef = useRef(0);

  useFrame((_, delta) => {
    if (!positions) return
    if (positions.length > 0) {
      elapsedTimeRef.current += delta;

      // Calculate the total duration of the animation
      const totalDuration = positions[positions.length - 1][3] - positions[0][3];

      // Calculate the current time in the animation
      const currentTime = positions[0][3] + (elapsedTimeRef.current % totalDuration);

      // Find the two positions to interpolate between
      let i = 0;
      while (i < positions.length - 1 && positions[i][3] < currentTime) {
        i++;
      }

      const [x1, y1, z1, t1] = positions[i - 1];
      const [x2, y2, z2, t2] = positions[i];

      // Interpolate between the two positions
      const t = (currentTime - t1) / (t2 - t1);
      const x = x1 + t * (x2 - x1);
      const y = y1 + t * (y2 - y1);
      const z = z1 + t * (z2 - z1);

      // Update the satellite's position
      if (satelliteRef.current) {
        satelliteRef.current.position.set(x, y, z);
      }
    }
  });

  return (
    <mesh ref={satelliteRef}>
      <sphereGeometry args={[0.01, 32, 32]}/>
    </mesh>
  );
}
