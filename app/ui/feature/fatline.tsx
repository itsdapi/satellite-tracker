import {useMemo} from "react";
import {Line2, LineGeometry, LineMaterial} from "three-fatline";
import {extend} from "@react-three/fiber";
import * as THREE from "three";

extend({Line2, LineGeometry, LineMaterial});

interface Line2ComponentProps {
  positions?: Float32Array;
  colors?: Float32Array;
  lineWidth?: number;
}

export default function Fatline({
                                  positions,
                                  colors,
                                  lineWidth = 0.008
                                }: Line2ComponentProps) {
  const material = useMemo(() => new LineMaterial({
    color: 0xffffff,
    linewidth: lineWidth,
    vertexColors: true,
  }), [lineWidth])

  const geometry = useMemo(() => {
    const geometry = new LineGeometry();
    if (positions) {
      geometry.setPositions(positions)
    }
    if (colors) {
      geometry.setColors(colors);
    } else {
      const colors = new Float32Array(9);
      const threeColor = new THREE.Color('white')
      threeColor.toArray(colors);
      geometry.setColors(colors);
    }
    return geometry;
  }, [positions, colors])

  return <primitive object={new Line2(geometry, material)}/>;
}
