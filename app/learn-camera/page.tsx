'use client'

import * as THREE from 'three'
import {Mesh} from 'three'
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import {useRef, useState} from "react";
import {CameraControls, Grid} from "@react-three/drei";
import {button, useControls} from "leva";
import {lookAtObject} from "@/app/lib/utils";

const {DEG2RAD} = THREE.MathUtils

const defaultCameraPosition: [number, number, number] = [6.73, 4, 7.6];

const defaultZoom = 1

const focusZoom = 2

export default function LearnCameraPage() {

  return <div className={'w-screen h-screen'}>
    <Canvas shadows camera={{position: defaultCameraPosition, fov: 60}} style={{background: '#d2d2d2'}}>
      <Scene/>
    </Canvas>
  </div>
}

function Ground() {
  const gridConfig = {
    cellSize: 0.5,
    cellThickness: 0.5,
    cellColor: '#6f6f6f',
    sectionSize: 3,
    sectionThickness: 1,
    sectionColor: '#9d4b4b',
    fadeDistance: 30,
    fadeStrength: 1,
    followCamera: false,
    infiniteGrid: true
  }
  return <Grid position={[0, -0.01, 0]} args={[10.5, 10.5]} {...gridConfig} />
}

function Scene() {
  const cameraControlsRef = useRef<CameraControls>(null);

  const {camera, scene} = useThree();

  const trackRef = useRef<Mesh | undefined>(undefined);

  const [{moveCamera, rotateSpeed}, set] = useControls(() => ({
    logCamera: button(() => {
      console.log('camera', camera.position)
    }),
    resetCamera: button(() => {
      if (cameraControlsRef.current) {
        cameraControlsRef.current.setPosition(...defaultCameraPosition, true).then()
      }
    }),
    getBoxes: button(() => {
      const boxes = scene.getObjectByName('boxes');
      console.log(boxes);
    }),
    trackOrangeBox: button(() => {
      const box = scene.getObjectByName('boxOrange') as Mesh | undefined
      trackRef.current = box;
      if (cameraControlsRef.current && box) {
        cameraControlsRef.current.zoomTo(focusZoom, true).then()
        lookAtObject(cameraControlsRef.current, box, [5, 5, 5])
      }
    }),
    trackPinkBox: button(() => {
      const box = scene.getObjectByName('boxPink') as Mesh | undefined;
      trackRef.current = box
      if (cameraControlsRef.current && box) {
        cameraControlsRef.current.zoomTo(focusZoom, true).then()
        lookAtObject(cameraControlsRef.current, box, [5, 5, 5])
      }
    }),
    untrack: button(() => {
      trackRef.current = undefined;
      if (cameraControlsRef.current) {
        cameraControlsRef.current.zoomTo(defaultZoom, true).then()
      }
    }),
    rotateSpeed: {value: 0.05},
    moveCamera: {value: false}
  }))

  useFrame(() => {
    if (cameraControlsRef.current && moveCamera) {
      cameraControlsRef.current.rotate(rotateSpeed * DEG2RAD, 0, true).then()
    }

    if (cameraControlsRef.current && trackRef.current) {
      cameraControlsRef.current.setTarget(trackRef.current.position.x, trackRef.current.position.y, trackRef.current.position.z, true).then()
    }
  });


  return <>
    <ambientLight intensity={Math.PI / 2}/>
    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI}/>
    <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI}/>
    <group name={'boxes'}>
      <BoxPink position={[-1.2, 1, 0]}/>
      <BoxOrange position={[1.2, 1, 0]}/>
    </group>
    <Ground/>
    <CameraControls ref={cameraControlsRef} enabled/>
  </>
}

function BoxOrange(props: JSX.IntrinsicElements['mesh']) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef<Mesh>(null)
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.position.x = Math.sin(meshRef.current.rotation.x)
    }
  })

  return (
    <mesh
      {...props}
      ref={meshRef}
      name={'boxOrange'}
      scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}>
      <boxGeometry args={[1, 1, 1]}/>
      <meshStandardMaterial color={'orange'}/>
    </mesh>
  )
}

function BoxPink(props: JSX.IntrinsicElements['mesh']) {
  // This reference will give us direct access to the mesh
  const meshRef = useRef<Mesh>(null)
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  // Subscribe this component to the render-loop, rotate the mesh every frame

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.position.y = 2 - Math.sin(meshRef.current.rotation.x)
    }
  })

  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      name={'boxPink'}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}>
      <boxGeometry args={[1, 1, 1]}/>
      <meshStandardMaterial color={'hotpink'}/>
    </mesh>
  )
}

