'use client'

import {Canvas, useFrame, useThree} from "@react-three/fiber";

import * as THREE from "three";
import {Euler, Mesh, Vector3} from "three";
import {useEffect, useRef, useState} from "react";
import {CameraControls, Stats} from "@react-three/drei";
import {button, buttonGroup, folder, useControls} from "leva";
import {lookAtSatellite} from "@/app/lib/utils";
import Earth from "@/app/ui/earth";
import StarField from "@/app/ui/feature/star-field";
import {Satellites} from "@/app/ui/feature/satellites";
import {
  calculateBatchTlePositions,
  SatelliteOrbitData,
  tleToScreenPosition
} from "@/app/lib/action/action-satellite-orbit";
import {fetchTles} from "@/app/lib/action/fetch-tles";
import dynamic from "next/dynamic";

const Orbits = dynamic(() => import('@/app/ui/feature/orbits'), {ssr: false})

const {DEG2RAD} = THREE.MathUtils

const globeRadius = 10

const defaultZoom = 0.25

const focusZoom = 0.5

const rotateSpeed = 0.01

export default function Home() {
  return (
    <main className={'w-screen h-screen'}>
      <Canvas style={{background: 'black'}} camera={{
        position: [-156, 64, -510],
        fov: 8,
        zoom: defaultZoom,
        near: 0.1,
        far: 10000,
      }}>
        <Scene/>
      </Canvas>
    </main>
  );
}

function Scene() {
  const [satList, setSatList] = useState<SatelliteOrbitData[]>([]);

  // Fetch Data
  useEffect(() => {
    const fetchPositions = async () => {
      const onlineTles = await fetchTles(10);
      if (onlineTles) {
        console.log("Calculating tles...");
        const dotsList = await calculateBatchTlePositions(onlineTles, {numPoints: 200, globeRadius: 10});
        // tleToScreenPosition(onlineTles[0].tle1, onlineTles[0].tle2, {numPoints: 80, globeRadius: 10}).then(console.log)
        setSatList(dotsList);
        console.log('list:', dotsList);
      }
    };
    fetchPositions().then();
  }, []);

  const trackRef = useRef<Mesh | undefined>(undefined);
  const cameraControlsRef = useRef<CameraControls>(null);

  const {scene, camera} = useThree()

  const setDefaultView = async () => {
    if (cameraControlsRef.current) {
      await Promise.all([
        cameraControlsRef.current.setPosition(15, 15, 19, true),
        cameraControlsRef.current.zoomTo(defaultZoom, true),
        cameraControlsRef.current.setTarget(0, 7, 0, true)
      ]);
    }
  }

  const [{activeSatIndex, noSpin}] = useControls(() => ({
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
      })
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
        lookAtSatellite(cameraControlsRef.current, sat, {offset: [10, -60, 50]})
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
      <Satellites satList={satList} selectedSat={activeSatIndex}/>
      <Orbits satList={satList} selectedSat={activeSatIndex} lineWidth={0.0009}/>
      <Earth radius={globeRadius}/>
      <StarField radiusOffset={50} starSize={5}/>
      <CameraControls
        ref={cameraControlsRef}
        enabled
      />
      <Stats/>
    </>
  );
}

function Light() {
  const Sunlight = () => <directionalLight position={[-2, -0.5, 1.5]} color={0xffffff} intensity={2.3}/>

  return <group>
    <ambientLight intensity={0.1}/>
    <Sunlight/>
  </group>
}

