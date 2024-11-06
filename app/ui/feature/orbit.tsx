import {SatellitePositionArray} from "@/app/lib/action/satellite";
import {useEffect, useRef} from "react";
import * as THREE from "three";

export function Orbit({positions}: { positions: SatellitePositionArray[] }) {
  const orbitRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const getOrbit = async () => {
      if (!positions) return;
      const vec3Point = positions.map((dot: number[]) => {
        const [x, y, z] = dot;
        return new THREE.Vector3(x, y, z);
      });

      // Add the first point to the end to close the line
      if (vec3Point.length > 0) {
        vec3Point.push(vec3Point[0]);
      }

      const group = new THREE.Group();
      const material = new THREE.LineBasicMaterial({color: '#ffffff'});
      const geometry = new THREE.BufferGeometry().setFromPoints(vec3Point);
      const line = new THREE.Line(geometry, material);
      group.add(line);

      if (group) {
        if (orbitRef.current) {
          orbitRef.current.add(group);
        }
      } else {
        console.error('Failed to create orbit line');
      }

    }

    getOrbit().then()
  }, [positions]);

  return <group ref={orbitRef}/>;
}
