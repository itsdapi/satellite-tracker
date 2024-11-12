import {SatelliteData} from "@/app/lib/action/satellite";
import {useRef} from "react";
import * as THREE from "three";
import {useFrame} from "@react-three/fiber";
import {Billboard, Text} from "@react-three/drei";
import {isValid, stringToHexColor} from "@/app/lib/utils";

export function Satellites({satList, selectedSat}: { satList: SatelliteData[], selectedSat?: number }) {
  const satellitesRef = useRef<THREE.Group>(null);
  const elapsedTimeRef = useRef(0);

  useFrame((_, delta) => {
    if (!satList || satList.length === 0) {
      return;
    }
    elapsedTimeRef.current += delta;

    satList.forEach(({position: positions}, satelliteIndex) => {
      if (positions.length > 0) {
        const totalDuration = positions[positions.length - 1][3] - positions[0][3];
        const currentTime = positions[0][3] + (elapsedTimeRef.current % totalDuration);

        let i = 0;
        while (i < positions.length - 1 && positions[i][3] < currentTime) {
          i++;
        }

        const [x1, y1, z1, t1] = positions[i - 1];
        const [x2, y2, z2, t2] = positions[i];

        const t = (currentTime - t1) / (t2 - t1);
        const x = x1 + t * (x2 - x1);
        const y = y1 + t * (y2 - y1);
        const z = z1 + t * (z2 - z1);

        if (satellitesRef.current) {
          const satelliteMesh = satellitesRef.current.children[satelliteIndex] as THREE.Mesh;
          satelliteMesh.position.set(x, y, z);
        }
      }
    });
  });

  return (
    <group ref={satellitesRef}>
      {satList.map(({name}, index) => (
        <mesh key={index} name={name}>
            <sphereGeometry args={[0.1, 32, 32]}/>
            <meshStandardMaterial
              color={
                isValid(selectedSat)
                  ? (index === selectedSat ? new THREE.Color('green') : new THREE.Color('white'))
                  : new THREE.Color(stringToHexColor(name))
              }
            />
            <Billboard>
              <Text
                font={'FZYXJF_2.ttf'}
                position={[0.3, -0.3, 0]} // Offset to bottom left corner
                fontSize={0.3}
                color={
                  isValid(selectedSat)
                    ? (index === selectedSat ? 'green' : 'white')
                    : stringToHexColor(name)
                }
                anchorX="left" // Align text to the left
              >
                {name}
              </Text>
            </Billboard>
        </mesh>
      ))}
    </group>
  );
}
