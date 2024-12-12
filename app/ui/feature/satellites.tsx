import {useRef} from "react";
import * as THREE from "three";
import {useFrame} from "@react-three/fiber";
import {Billboard, Text} from "@react-three/drei";
import {Line2} from "three-fatline";
import {SatelliteOrbitData} from "@/app/lib/action/action-satellite-orbit";
import {isValid, stringToHexColor} from "@/app/lib/utils";
import ConnectionLine from "@/app/ui/feature/connection-line";

export function Satellites({satList, selectedSat, showConnectionLine}: {
  satList: SatelliteOrbitData[],
  selectedSat?: number,
  showConnectionLine?: boolean
}) {
  const satellitesRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!satList || satList.length === 0) {
      return;
    }

    const currentTime = Date.now() / 1000; // Convert to seconds

    satList.forEach(({position: positions}, satelliteIndex) => {
      if (positions.length > 0) {
        let i = 0;
        while (i < positions.length - 1 && positions[i][3] < currentTime) {
          i++;
        }

        if (i === 0) {
          // Before the first timestamp
          const [x, y, z] = positions[0];
          if (satellitesRef.current) {
            const satelliteMesh = satellitesRef.current.children[satelliteIndex] as THREE.Mesh;
            satelliteMesh.position.set(x, y, z);
          }
        } else if (i === positions.length) {
          // After the last timestamp
          const [x, y, z] = positions[positions.length - 1];
          if (satellitesRef.current) {
            const satelliteMesh = satellitesRef.current.children[satelliteIndex] as THREE.Mesh;
            satelliteMesh.position.set(x, y, z);
          }
        } else {
          // Interpolate between two positions
          const [x1, y1, z1, t1] = positions[i - 1];
          const [x2, y2, z2, t2] = positions[i];

          const t = (currentTime - t1) / (t2 - t1);
          const x = x1 + t * (x2 - x1);
          const y = y1 + t * (y2 - y1);
          const z = z1 + t * (z2 - z1);

          if (satellitesRef.current) {
            const satelliteGroup = satellitesRef.current.children[satelliteIndex] as THREE.Group;
            const satelliteMesh = satelliteGroup.children[0] as THREE.Mesh;
            satelliteMesh.position.set(x, y, z);

            if (isValid(selectedSat) && showConnectionLine) {
              const connectionLine = satelliteGroup.children[1] as Line2;
              if (connectionLine) {
                const positions = new Float32Array([0, 0, 0, x, y, z]); // Start at the absolute center of the Earth
                connectionLine.geometry.setPositions(positions);
                connectionLine.computeLineDistances()
              }
            }
          }
        }
      }
    });
  });

  return (
    <group ref={satellitesRef} name={"satellites"}>
      {satList.map(({name}, index) => (
        <group key={index}>
          <mesh name={name}>
            <sphereGeometry args={[0.06, 32, 32]}/>
            <meshBasicMaterial
              color={
                isValid(selectedSat)
                  ? (index === selectedSat ? new THREE.Color("#ffcc00") : new THREE.Color("white"))
                  : new THREE.Color(stringToHexColor(name))
              }
            />
            <Billboard>
              <Text
                font={"FZYXJF_2.ttf"}
                position={[0.2, -0.2, 0]} // Offset to bottom left corner
                fontSize={0.2}
                color={
                  isValid(selectedSat)
                    ? (index === selectedSat ? "#ffcc00" : "white")
                    : stringToHexColor(name)
                }
                anchorX="left" // Align text to the left
              >
                {name}
              </Text>
            </Billboard>
          </mesh>
          {showConnectionLine && isValid(selectedSat) && index === selectedSat && (
            <ConnectionLine />
          )}
        </group>
      ))}
    </group>
  );
}
