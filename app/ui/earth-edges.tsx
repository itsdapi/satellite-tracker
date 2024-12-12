import {useEffect, useMemo, useRef} from "react";
import * as THREE from 'three'
import {drawThreeGeo} from "@/app/lib/three-geo-json";
import LandBoundary from "@/public/geojson/ne_110m_land.json"
import ChinaBoundary from "@/public/geojson/full_china_boundary.json"

export default function EarthEdges({radius = 10}: { radius: number }) {
  const earthEdgesGroupRef = useRef<THREE.Group>(null);
  const landGroupRef = useRef<THREE.Group>(null);
  const countryGroupRef = useRef<THREE.Group>(null);

  // Create the globe geometry
  // I use this to fill in the center of the earth to block the visibility to the back of the globe
  const globeGeometry = useMemo(() => new THREE.SphereGeometry(radius, 30), [radius])
  const globeMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.99
  }), [])

  // Create the globe mesh
  const globeEdges = useMemo(() => new THREE.EdgesGeometry(globeGeometry, 0.5), [globeGeometry])
  const globeLineMat = useMemo(() => new THREE.LineBasicMaterial({
    color: 0x3E3E3E,
    transparent: true,
    opacity: 0.2
  }), [])
  // Don't ask me why I use memo to create three object. It has some pretty wired bug which looks kinda pretty. So I kept it ;)
  const globeMeshLine = useMemo(() => new THREE.LineSegments(globeEdges, globeLineMat), [globeEdges, globeLineMat])

  useEffect(() => {
    const earthEdgesGroup = earthEdgesGroupRef.current;
    const landGroup = landGroupRef.current;
    const countryGroup = countryGroupRef.current;

    if (earthEdgesGroup) {
      earthEdgesGroup.add(globeMeshLine);
    }

    if (landGroup) {
      drawThreeGeo(LandBoundary, radius, 'sphere', {
        color: '#d3d3d3'
      }, landGroup);
    }

    if (countryGroup) {
      drawThreeGeo(ChinaBoundary, radius, 'sphere', {
        color: '#ff0000'
      }, countryGroup);
    }

    return () => {
      if (earthEdgesGroup) {
        earthEdgesGroup.remove(globeMeshLine);
      }
    }
  }, [globeMeshLine, radius]);

  return <group name={'earth-edges'} ref={earthEdgesGroupRef}>
    <mesh material={globeMat} geometry={globeGeometry} scale={0.99}/>
    <group name={'geoJson-group'} rotation={new THREE.Euler(Math.PI / 2, Math.PI)}>
      <group ref={landGroupRef} scale={1.01}/>
      <group ref={countryGroupRef} scale={1.02}/>
    </group>
  </group>
}
