'use client'

import {Canvas} from "@react-three/fiber";
import {CameraControls} from "@react-three/drei";
import {useRef} from "react";
import Earth from "@/app/ui/earth";
import StarField from "@/app/ui/feature/star-field";

export default function GlobePage() {
  return <div className={'w-screen h-screen'}>
    <Canvas style={{background: 'black'}}>
      <Scene/>
    </Canvas>
  </div>
}

export function Scene() {
  const cameraControlsRef = useRef<CameraControls>(null);

  return <>
    <Light/>
    <Earth/>
    <StarField/>
    <CameraControls ref={cameraControlsRef} enabled/>
  </>
}

function Light() {
  const Sunlight = () => <directionalLight position={[-2, -0.5, 1.5]} color={0xffffff} intensity={2.3}/>

  return <group>
    <ambientLight intensity={0.1}/>
    <Sunlight/>
  </group>
}
