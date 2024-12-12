import {useRef} from "react";
import * as THREE from "three";
import {nowToSunAngle, sunAngleToPosition} from "@/app/lib/utils";

interface SunlightProps {
  intensity?: number;
}

export default function Sunlight(props: SunlightProps) {
  return <SunlightTimeWrapper now={Date.now()} {...props} />;
}

function SunlightTimeWrapper({now, intensity = 2.3}: SunlightProps & { now: number }) {
  const sunlight = useRef<THREE.DirectionalLight>(null);

  return <group>
    <directionalLight position={sunAngleToPosition(nowToSunAngle(now))} color={0xffffff} intensity={intensity}
                      ref={sunlight}/>
  </group>;
}
