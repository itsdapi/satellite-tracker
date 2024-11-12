import {useMemo} from "react";
import * as THREE from "three";
import {useLoader} from "@react-three/fiber";

function StarField({numStars = 1000, starSize = 1, radiusOffset = 25}: {
  numStars?: number,
  starSize?: number,
  radiusOffset?: number
}) {
  const texture = useLoader(THREE.TextureLoader, "textures/stars/circle.png");

  const stars = useMemo(() => {
    const positions = [];
    const colors = [];
    for (let i = 0; i < numStars; i++) {
      const radius = Math.random() * 25 + radiusOffset;
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      positions.push(x, y, z);
      const color = new THREE.Color().setHSL(0.6, 0.2, Math.random());
      colors.push(color.r, color.g, color.b);
    }
    return {positions, colors};
  }, [numStars]);

  return (
    <mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach={"attributes-position"}
            array={new Float32Array(stars.positions)}
            count={stars.positions.length / 3}
            itemSize={3}
          />
          <bufferAttribute
            attach={"attributes-color"}
            array={new Float32Array(stars.colors)}
            count={stars.colors.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.2 * starSize}
          vertexColors
          map={texture}
          transparent
        />
      </points>
    </mesh>
  );
}

export default StarField;
