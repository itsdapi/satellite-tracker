'use client'

import {Canvas, useFrame, useThree} from "@react-three/fiber";

import * as THREE from "three";
import {Euler, Mesh, Vector3} from "three";
import {Suspense, useEffect, useRef, useState} from "react";
import {CameraControls, Html, Stats} from "@react-three/drei";
import {button, buttonGroup, folder, useControls} from "leva";
import {lookAtSatellite} from "@/app/lib/utils";
import {calculateBatchTlePositions, SatelliteOrbitData} from "@/app/lib/action/action-satellite-orbit";
import {fetchTles} from "@/app/lib/action/fetch-tles";
import {Satellites} from "@/app/ui/feature/satellites";
import EarthEdges from "@/app/ui/earth-edges";
import Orbits from "@/app/ui/feature/orbits";
import StarField from "@/app/ui/feature/star-field";
import {Bloom, EffectComposer, Noise, Vignette} from "@react-three/postprocessing";
import Earth from "@/app/ui/earth";
import Sunlight from "@/app/ui/feature/sunlight";

const {DEG2RAD} = THREE.MathUtils

// Config
const globeRadius = 10
const defaultZoom = 0.1
const focusZoom = 0.5
const rotateSpeed = -0.002

export default function Home() {
  return (
    <main className={'w-screen h-screen'}>
      <Canvas style={{background: 'black'}} camera={{
        position: [-156, 64, -510],
        fov: 1,
        zoom: defaultZoom,
        near: 0.1,
        far: 10000,
      }}>
        <EffectComposer>
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.1} intensity={1.5} height={800} mipmapBlur/>
          <Noise opacity={0.05}/>
          <Vignette eskil={false} offset={0.1} darkness={0.9}/>
        </EffectComposer>
        <Suspense fallback={<Html center>Loading...</Html>}>
          <Scene/>
        </Suspense>
      </Canvas>
    </main>
  );
}

function Scene() {
  const [satList, setSatList] = useState<SatelliteOrbitData[]>([]);
  const earthSpinGroupRef = useRef<THREE.Group>(null);

  // Fetch Satellite Data
  // Get all the TLEs from the API, and then calculate the positions of the satellites
  useEffect(() => {
    const fetchPositions = async () => {
      // Fetch TLEs, can set the amount
      const onlineTles = await fetchTles(10);
      if (onlineTles) {
        console.log("Calculating tles...");
        const dotsList = await calculateBatchTlePositions(onlineTles, {numPoints: 200, globeRadius});
        setSatList(dotsList);
        console.log('list:', dotsList);
      }
    };
    fetchPositions().then();
  }, []);

  const trackRef = useRef<Mesh | undefined>(undefined);
  const cameraControlsRef = useRef<CameraControls>(null);

  const {scene, camera} = useThree()

  // Set Default Camera View
  const setDefaultView = async () => {
    if (cameraControlsRef.current) {
      await Promise.all([
        cameraControlsRef.current.setPosition(150, 15, 40, true),
        cameraControlsRef.current.zoomTo(defaultZoom, true),
        cameraControlsRef.current.setTarget(0, 0, 0, true)
      ]);
    }
  }

  const [{activeSatIndex, noSpin, useEdgeEarth}] = useControls(() => ({
    trackSat: folder({
      activeSatIndex: {value: -1, label: 'Target'},
    }),
    camera: folder({
      noSpin: {value: false},
      freeCamera: button(() => {
        trackRef.current = undefined;
      }),
      zoom: buttonGroup({
        'Zoom In': () => {
          if (cameraControlsRef.current) {
            cameraControlsRef.current.zoomTo(camera.zoom + 0.1, true).then()
          }
        },
        'Zoom Out': () => {
          if (cameraControlsRef.current) {
            cameraControlsRef.current.zoomTo(camera.zoom - 0.1, true).then()
          }
        }
      }),
      logCameraParams: button(() => {
        if (cameraControlsRef.current) {
          const target = new Vector3();
          cameraControlsRef.current.getTarget(target)
          const euler = new Euler();
          euler.setFromQuaternion(camera.quaternion);

          const phi = euler.x;
          const theta = euler.y;
          console.log('Camera Params:', {
            position: cameraControlsRef.current.camera.position,
            zoom: camera.zoom,
            target: target,
            rotation: {
              phi: phi,
              theta: theta
            }
          });
        }
      }),
      resetCamera: button(() => {
        if (cameraControlsRef.current) {
          cameraControlsRef.current.setPosition(-156, 64, -510, true).then()
          cameraControlsRef.current.zoomTo(defaultZoom, true).then()
          cameraControlsRef.current.setTarget(0, 0, 0, true).then()
        }
      }),
      useEdgeEarth: {value: true},
    }),
  }));

  // Handle Active Satellite change
  useEffect(() => {
    if (!cameraControlsRef.current) return

    // Reset Camera
    if (satList[activeSatIndex] === undefined) {
      trackRef.current = undefined;
      setDefaultView().then()
    } else {
      const sat = scene.getObjectByName(satList[activeSatIndex].name) as Mesh | undefined;
      console.log('Tracking:', sat?.name)
      trackRef.current = sat;
      if (sat) {
        cameraControlsRef.current.zoomTo(focusZoom, true).then()
        lookAtSatellite(cameraControlsRef.current, sat, {offset: [10, -60, 300]})
      }
    }
  }, [activeSatIndex, satList, scene]);

  useFrame(() => {
    if (!cameraControlsRef.current) return

    // Handle tracking Satellite
    if (trackRef.current) {
      cameraControlsRef.current.setTarget(trackRef.current.position.x, trackRef.current.position.y, trackRef.current.position.z, true).then()
    }

    // Handle Globe rotation
    if (!trackRef.current && !noSpin) {
      cameraControlsRef.current.rotate(rotateSpeed * DEG2RAD, 0, true).then()
    }
  })

  return (
    <>
      <Light/>
      <group name={'globe-spin-group'} ref={earthSpinGroupRef}>
        <Satellites satList={satList} selectedSat={activeSatIndex} showConnectionLine/>
        <Orbits satList={satList} selectedSat={activeSatIndex} lineWidth={0.0008}/>
        {useEdgeEarth ? <EarthEdges radius={globeRadius}/> : <Earth radius={globeRadius}/>}
      </group>
      <StarField radiusOffset={50} starSize={5} ignoreFog={true}/>
      <CameraControls
        ref={cameraControlsRef}
        enabled
      />
      <Stats/>
    </>
  );
}

function Light() {
  return <group>
    <ambientLight intensity={0.2}/>
    <Sunlight/>
  </group>
}

