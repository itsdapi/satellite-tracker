import {useMemo} from "react";
import * as THREE from "three";
import {isValid, stringToHexColor} from "@/app/lib/utils";
import {SatelliteOrbitData} from "@/app/lib/action/action-satellite-orbit";
import Fatline from "@/app/ui/feature/fatline";

interface OrbitProps {
  satList: SatelliteOrbitData[];
  selectedSat?: number;
  lineWidth?: number;
}

export default function Orbits({satList, selectedSat, lineWidth = 0.008}: OrbitProps) {
  const geometries = useMemo(() => {
    if (!Array.isArray(satList) || satList.length === 0) {
      return [];
    }
    return satList.map(({position: satPositions}) => {
      const positions = new Float32Array(satPositions.length * 3);
      let index = 0;
      for (let i = 0; i < satPositions.length; i++) {
        positions[index++] = satPositions[i][0];
        positions[index++] = satPositions[i][1];
        positions[index++] = satPositions[i][2];
      }

      positions[index++] = satPositions[0][0];
      positions[index++] = satPositions[0][1];
      positions[index++] = satPositions[0][2];
      return positions;
    });
  }, [satList]);

  const colorsArrays = useMemo(() => {
    if (!Array.isArray(satList) || satList.length === 0) {
      return [];
    }
    return satList.map(({position: satPositions, name}) => {
      const colors = new Float32Array(satPositions.length * 3);
      let globalIndex = 0;
      const color = new THREE.Color(
        !isValid(selectedSat)
          ? stringToHexColor(name)
          : '#ffcc00'
      );
      for (let i = 0; i < satPositions.length; i++) {
        color.toArray(colors, globalIndex * 3);
        globalIndex++;
      }
      return colors;
    });
  }, [satList, selectedSat]);

  const filteredGeometries = isValid(selectedSat) ? [geometries[selectedSat!]] : geometries;
  const filteredColorsArrays = isValid(selectedSat) ? [colorsArrays[selectedSat!]] : colorsArrays;

  return (
    <group>
      {filteredGeometries.map((positions, index) => (
        <Fatline
          key={index}
          positions={positions}
          colors={filteredColorsArrays[index]}
          lineWidth={lineWidth}
        />
      ))}
    </group>
  );
}
