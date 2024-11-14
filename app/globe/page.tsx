'use client'

import {Canvas} from "@react-three/fiber";
import {CameraControls} from "@react-three/drei";
import {useRef} from "react";
import Earth from "@/app/ui/earth";
import StarField from "@/app/ui/feature/star-field";
import Sunlight from "@/app/ui/feature/sunlight";
import {TestPoint} from "@/app/ui/feature/test-point";

export default function GlobePage() {
  return <div className={'w-screen h-screen'}>
    <Canvas style={{background: 'black'}} camera={{position: [0, 0, 30]}}>
      <Scene/>
    </Canvas>
  </div>
}

const EARTH_RADIUS = 10

export function Scene() {
  const cameraControlsRef = useRef<CameraControls>(null);

  return <>
    <Light/>

    {/*北京*/}
    <TestPoint location={[116.395156, 39.908649]} color={'red'} radius={EARTH_RADIUS}/>

    {/*高雄*/}
    <TestPoint location={[120.285232, 22.639292]} color={'green'} radius={EARTH_RADIUS}/>

    {/*海口*/}
    <TestPoint location={[110.211466, 20.018075]} color={'yellow'} radius={EARTH_RADIUS}/>

    <TestPoint location={[-168.015131, 65.575931]} color={'pink'} radius={EARTH_RADIUS}/>
    {/*<TestPoint location={[-175.541075,-1.007232]} color={'red'}/>*/}
    {/*<TestPoint location={[0,90]} color={'blue'}/>*/}

    {/*<TestPoint location={[90, 0]} color={'green'}/>*/}

    {/*<TestPoint location={[-90, 0]} color={'purple'}/>*/}
    <Earth radius={EARTH_RADIUS}/>
    <StarField/>
    <group>
      <axesHelper scale={EARTH_RADIUS * 10}/>
    </group>
    <CameraControls ref={cameraControlsRef} enabled/>
  </>
}

function Light() {

  return <group>
    <ambientLight intensity={0.2}/>
    <Sunlight/>
  </group>
}


