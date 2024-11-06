import {SatelliteData} from "@/app/lib/action/satellite";
import {useEffect, useMemo, useRef} from "react";
import * as THREE from "three";
import {Line2, LineGeometry, LineMaterial} from "three-fatline";
import {extend} from "@react-three/fiber";
import {stringToHexColor} from "@/app/lib/utils";

extend({Line2, LineGeometry, LineMaterial});

interface OrbitProps {
  satList: SatelliteData[];
  selectedSat?: number;
  // 0.008 is quite thick, 0.004 is pretty good
  lineWidth?: number;
}

export default function Orbits({satList, selectedSat, lineWidth = 0.008}: OrbitProps) {
  const lineRef = useRef<THREE.Group>(null);
  const geometries = useMemo(() => {
    if (!Array.isArray(satList) || satList.length === 0) {
      return [];
    }
    return satList.map(([satPositions]) => {
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
    return satList.map(([satPositions, name], satIndex) => {
      const colors = new Float32Array(satPositions.length * 3);
      let globalIndex = 0;
      const color = new THREE.Color(
        selectedSat === undefined
          ? stringToHexColor(name)
          : satIndex === selectedSat
            ? 'green'
            : 'white'
      );
      for (let i = 0; i < satPositions.length; i++) {
        color.toArray(colors, globalIndex * 3);
        globalIndex++;
      }
      return colors;
    });
  }, [satList, selectedSat]);

  useEffect(() => {
    if (lineRef.current && satList.length > 0) {
      lineRef.current.clear();
      satList.forEach((_, satIndex) => {
        const geometry = new LineGeometry();
        geometry.setPositions(geometries[satIndex]);
        geometry.setColors(colorsArrays[satIndex]);
        const material = new LineMaterial({
          color: 0xffffff,
          linewidth: lineWidth,
          vertexColors: true,
          dashed: false,
        });
        const line = new Line2(geometry, material);
        line.computeLineDistances();
        if (lineRef.current) {
          lineRef.current.add(line);
        }
      });
    }
  }, [geometries, colorsArrays, satList.length, satList]);
  return (
    <group ref={lineRef}/>
  );
}
