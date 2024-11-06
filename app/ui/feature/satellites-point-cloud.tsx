import {SatelliteData} from "@/app/lib/action/satellite";
import {useEffect, useMemo, useRef} from "react";
import * as THREE from "three";
import {TextureLoader} from "three";
import {useFrame, useLoader} from "@react-three/fiber";
import {generateSecondaryColor} from "@marko19907/string-to-color";
import {config} from "@/app.config";

const vertexShader = `
attribute float size;
attribute vec3 customColor;

varying vec3 vColor;

void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform vec3 color;
uniform sampler2D pointTexture;
uniform float alphaTest;

varying vec3 vColor;

void main() {
    gl_FragColor = vec4(color * vColor, 1.0);
    gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
    if (gl_FragColor.a < alphaTest) discard;
}
`;

/**
 * Satellite point cloud
 * @param satList Satellite list
 * @param selectedSat Current Selected Satellite, provide index of the satList to highlight
 * @constructor
 */
export function SatellitesPointCloud({satList, selectedSat}: { satList: SatelliteData[], selectedSat?: number }) {
  const sprite = useLoader(TextureLoader, 'sprites/disc-directional.png');
  const pointsRef = useRef<THREE.Points>(null);
  const elapsedTimeRef = useRef(0);

  const numPoints = useMemo(() => satList.reduce((sum, [positions]) => sum + positions.length, 0), [satList]);
  const positions = useMemo(() => new Float32Array(numPoints * 3), [numPoints]);

  const pointColor = useRef(new THREE.Color(0xffffff));
  const sizesArray = useMemo(() => new Float32Array(numPoints).fill(0.2), [numPoints]);
  const colorsArray = useMemo(() => {
    const colors = new Float32Array(numPoints * 3);
    let index = 0;
    satList.forEach(([positions, name]) => {
      const hslString = generateSecondaryColor(name, config.colorOptions);
      const hslValue = hslString.match(/\d+/g)?.map(Number);
      if (!hslValue) return;
      const color = new THREE.Color().setHSL(hslValue[0] / 360, hslValue[1] / 100, hslValue[2] / 100);
      for (let i = 0; i < positions.length; i++) {
        color.toArray(colors, index * 3);
        index++;
      }
    });
    return colors;
  }, [numPoints, satList]);

  useEffect(() => {
    console.log('Selected Satellite:', selectedSat);
    console.log('Satellite List:', satList);
  }, [selectedSat, satList]);

  useEffect(() => {
    if (selectedSat !== undefined) {
      const newColorsArray = new Float32Array(numPoints * 3);
      let index = 0;
      satList.forEach((satellite, satIndex) => {
        const [positions] = satellite;
        const color = new THREE.Color(satIndex === selectedSat ? 0x00ff00 : 0xffffff);
        for (let i = 0; i < positions.length; i++) {
          color.toArray(newColorsArray, index * 3);
          index++;
        }
      });
      const colorAttribute = pointsRef.current?.geometry.attributes.customColor;
      if (colorAttribute) {
        const newColorAttribute = new THREE.BufferAttribute(newColorsArray, 3);
        pointsRef.current.geometry.setAttribute('customColor', newColorAttribute);
      }
    }
  }, [selectedSat, satList, numPoints]);

  useFrame((_, delta) => {
    if (!satList || satList.length === 0) return;
    elapsedTimeRef.current += delta;

    const positionsArray = pointsRef.current?.geometry.attributes.position.array as Float32Array;

    let index = 0;
    satList.forEach(([positions]) => {
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

        positionsArray[index++] = x;
        positionsArray[index++] = y;
        positionsArray[index++] = z;
      }
    });

    if (pointsRef.current && pointsRef.current.geometry && pointsRef.current.geometry.attributes.position) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (pointsRef.current && pointsRef.current.geometry && pointsRef.current.geometry.attributes.size) {
      pointsRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });

  return (
    <>
      {satList.length !== 0 && <points ref={pointsRef}>
          <bufferGeometry>
              <bufferAttribute
                  name={'customColor'}
                  attach={"attributes-customColor"}
                  array={colorsArray}
                  itemSize={3}
                  count={colorsArray.length / 3}
              />
              <bufferAttribute
                  name={'position'}
                  attach="attributes-position"
                  array={positions}
                  itemSize={3}
                  count={positions.length / 3}
              />
              <bufferAttribute
                  name={'size'}
                  attach="attributes-size"
                  array={sizesArray}
                  itemSize={1}
                  count={sizesArray.length}
              />
          </bufferGeometry>
          <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={{
            color: {value: pointColor.current},
            pointTexture: {value: sprite},
            alphaTest: {value: 0.9}
          }}/>
      </points>}
    </>
  );
}
