'use client'

import {Canvas} from "@react-three/fiber";
import {CameraControls} from "@react-three/drei";
import {useRef} from "react";
import Earth from "@/app/ui/earth";
import StarField from "@/app/ui/feature/star-field";
import {geoToCartesian} from "@/app/lib/utils";
import {Color} from "three";

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
    <TestPoint location={[116.395156,39.908649]} color={'red'}/>

    {/*高雄*/}
    <TestPoint location={[120.285232,22.639292]} color={'green'}/>

    {/*海口*/}
    <TestPoint location={[110.211466,20.018075]} color={'yellow'}/>

    <TestPoint location={[-168.015131,65.575931]} color={'pink'}/>
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
  const Sunlight = () => <directionalLight position={[-2, -0.5, 1.5]} color={0xffffff} intensity={2.3}/>

  return <group>
    <ambientLight intensity={1}/>
    <Sunlight/>
  </group>
}

function TestPoint({location, color}: { location: [number, number], color?: string }) {

  return <mesh position={geoToCartesian(location[0], location[1], 0, EARTH_RADIUS)} scale={0.3}>
    <sphereGeometry />
    <meshBasicMaterial color={new Color(color)}/>
  </mesh>
}
