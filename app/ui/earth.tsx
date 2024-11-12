import {useRef} from "react";
import {AdditiveBlending, Mesh, TextureLoader} from "three";
import {useFrame, useLoader} from "@react-three/fiber";
import StarField from "@/app/ui/feature/star-field";
import {FresnelMaterial} from "@/app/ui/feature/fresnel-material";

export default function Earth({radius = 2}: { radius?: number }) {
  const cloudRef = useRef<Mesh>(null);
  const detail = 12

  const dayTexture = useLoader(TextureLoader, 'textures/8k_earth_daymap.jpg');
  const nightTexture = useLoader(TextureLoader, 'textures/8k_earth_nightmap.jpg');
  const cloudTexture = useLoader(TextureLoader, 'textures/8k_earth_clouds.jpg');

  const Geometry = () => <icosahedronGeometry args={[radius, detail]}/>

  useFrame(() => {
    // Move clouds
    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.00002
    }
  })

  return <group name={'earth'}>
    <mesh name={'dayMap'}>
      <Geometry/>
      <meshStandardMaterial map={dayTexture}/>
    </mesh>
    <mesh name={'nightMap'} scale={1.001}>
      <Geometry/>
      <meshBasicMaterial map={nightTexture} blending={AdditiveBlending}/>
    </mesh>
    <mesh scale={1.008} name={'cloud'} ref={cloudRef}>
      <Geometry/>
      <meshStandardMaterial map={cloudTexture} transparent opacity={0.9} blending={AdditiveBlending}/>
    </mesh>
    <mesh scale={1.01}>
      <Geometry/>
      <FresnelMaterial opacity={0.8}/>
    </mesh>
  </group>
}
