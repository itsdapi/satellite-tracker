import {geoToCartesian} from "@/app/lib/utils";
import * as THREE from "three";
import {useEffect, useRef} from "react";

export default function GroundStation({location, radius}: { location: [number, number], radius: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useEffect(() => {
    const centerPoint = location; // San Francisco
    const radiusKm = 8; // radius of the arc in kilometers

    const numSegments = 100;

    const points = [];
    for (let i = 0; i <= numSegments; i++) {
      const angle = (i / numSegments) * 2 * Math.PI;
      const lat = centerPoint[0] + (radiusKm / radius) * Math.cos(angle);
      const lon = centerPoint[1] + (radiusKm / radius) * Math.sin(angle);
      const point = new THREE.Vector3(...geoToCartesian(lat, lon, radius));
      points.push(point);
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeometry = new THREE.TubeGeometry(curve, numSegments, 0.02, 5, false);

    if (meshRef.current) {
      meshRef.current.geometry = tubeGeometry;
    }
  }, [location, radius]);

  return (
    <>
      <mesh ref={meshRef} position={geoToCartesian(...location, radius)}>
        <meshBasicMaterial color={'#ff0000'}/>
      </mesh>
      <mesh position={geoToCartesian(...location, radius)}>
        <sphereGeometry args={[0.1, 64, 64]}/>
        <meshBasicMaterial color={'#ff0000'} opacity={0.5}/>
      </mesh>
    </>

  );
}
