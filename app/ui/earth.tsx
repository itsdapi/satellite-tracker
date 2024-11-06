'use client'

import {Canvas, useLoader} from "@react-three/fiber";
import {TextureLoader} from "three";
import {Suspense, useEffect, useState} from "react";
import {calculateBatchTlePositions, fetchTles, SatelliteData} from "@/app/lib/action/satellite";
import {OrbitControls, Stats} from '@react-three/drei'
import {useActiveSat} from "@/app/lib/context/active-sat-content";
import {Satellites} from "@/app/ui/feature/satellites";
import Orbits from "@/app/ui/feature/orbits";

function Earth() {
  const [satList, setSatList] = useState<SatelliteData[]>([]);
  const {activeSatIndex} = useActiveSat();

  useEffect(() => {
    const fetchPositions = async () => {
      const onlineTles = await fetchTles(10);
      if (onlineTles) {
        console.log("Calculating tles...");
        const dotsList = await calculateBatchTlePositions(onlineTles, {numPoints: 80});
        console.log('Setting positions list...');
        setSatList(dotsList);
      }
    };

    fetchPositions().then();
  }, []);

  return (
    <Canvas style={{background: 'black'}}
            camera={{
              fov: 30,
              zoom: 1
            }}
    >
      <ambientLight intensity={Math.PI / 2}/>
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI}/>
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI}/>
      <Suspense fallback={null}>
        {/*<SatellitesPointCloud satList={satList} selectedSat={activeSatIndex}/>*/}
        <Satellites satList={satList} selectedSat={activeSatIndex}/>
        <Orbits satList={satList} selectedSat={activeSatIndex} lineWidth={0.004}/>
        <Globe/>
      </Suspense>
      <OrbitControls enableDamping rotateSpeed={0.25} dampingFactor={0.1} zoomSpeed={0.2}/>
      <Stats/>
    </Canvas>
  );
}

function Globe() {
  const earthTexture = useLoader(TextureLoader, 'world-map.webp');
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]}/>
      <meshStandardMaterial map={earthTexture}/>
    </mesh>
  );
}

export default Earth;
