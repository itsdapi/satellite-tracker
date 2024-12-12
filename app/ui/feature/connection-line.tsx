import {useMemo} from "react";
import {Line2, LineGeometry, LineMaterial} from "three-fatline";
import {extend, useFrame} from "@react-three/fiber";
import * as THREE from "three";

extend({Line2, LineGeometry, LineMaterial});

interface Line2ComponentProps {
  positions?: Float32Array;
  lineWidth?: number;
  startColor?: string;
  endColor?: string;
  dashOffsetSpeed?: number;
  dashSize?: number;
  gapSize?: number;
}

function generateGradientColors(startColor: THREE.Color, endColor: THREE.Color, steps: number): Float32Array {
  const colors = new Float32Array(steps * 3);
  for (let i = 0; i < steps; i++) {
    const color = startColor.clone().lerp(endColor, i / (steps - 1));
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  return colors;
}

export default function ConnectionLine({
                                         positions = new Float32Array([0, 0, 0, 0, 0, 0]),
                                         lineWidth = 0.5,
                                         startColor = "#ff9e0a",
                                         endColor = "#3b1900",
                                         dashOffsetSpeed = 0.5,
                                         dashSize = 0.1,
                                         gapSize = 0.1
                                       }: Line2ComponentProps) {

  const material = useMemo(() => new LineMaterial({
    vertexColors: true,
    linewidth: lineWidth, // px
    resolution: new THREE.Vector2(640, 480), // resolution of the viewport
    dashed: true,
    dashSize: dashSize,
    gapSize: gapSize
  }), [lineWidth, dashSize, gapSize])

  const geometry = useMemo(() => {
    const startColorObj = new THREE.Color(startColor);
    const endColorObj = new THREE.Color(endColor);
    const colors = generateGradientColors(endColorObj, startColorObj, positions.length / 3);

    const geometry = new LineGeometry();
    geometry.setColors(colors);
    geometry.setPositions(positions)
    return geometry;
  }, [positions, startColor, endColor])

  useFrame(({clock}) => {
    if (material.uniforms.dashOffset.value >= 1000) {
      material.uniforms.dashOffset.value = 0;
    } else {
      material.uniforms.dashOffset.value = clock.getElapsedTime() * dashOffsetSpeed;
    }
  });

  return <primitive object={new Line2(geometry, material)}/>;
}
