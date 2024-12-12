import * as THREE from "three";
import {AdditiveBlending} from "three";

interface FresnelMaterialProps {
  rimHex?: number,
  facingHex?: number,
  opacity?: number,
}

export default function FresnelMaterial({rimHex = 0x00539d, facingHex = 0x000000, opacity}: FresnelMaterialProps) {
  const uniforms = {
    color1: {value: new THREE.Color(rimHex)},
    color2: {value: new THREE.Color(facingHex)},
    fresnelBias: {value: 0.1},
    fresnelScale: {value: 1.0},
    fresnelPower: {value: 4.0},
  };
  const vs = `
  uniform float fresnelBias;
  uniform float fresnelScale;
  uniform float fresnelPower;

  varying float vReflectionFactor;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );

    vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );

    vec3 I = worldPosition.xyz - cameraPosition;

    vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower );

    gl_Position = projectionMatrix * mvPosition;
  }
  `;
  const fs = `
  uniform vec3 color1;
  uniform vec3 color2;

  varying float vReflectionFactor;

  void main() {
    float f = clamp( vReflectionFactor, 0.0, 1.0 );
    gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
  }
  `;

  return <shaderMaterial uniforms={uniforms} vertexShader={vs} fragmentShader={fs} transparent={true}
                         blending={AdditiveBlending} opacity={opacity}/>
}
