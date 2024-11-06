'use client'

import Globe from "react-globe.gl";
import * as THREE from "three";
import { useEffect, useRef, useState, useMemo } from "react";
import { fetchTles, calculateBatchTlePositions, SatellitePositionArray, SatelliteData } from "@/app/lib/action/satellite-coord";

export default function EarthGGL() {
  const globeEl = useRef();
  const [satelliteData, setSatelliteData] = useState<SatellitePositionArray[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Time ticker
    const frameTicker = () => {
      requestAnimationFrame(frameTicker);
      setTime(time => new Date(+time + 3000)); // 3 seconds per frame
    };
    frameTicker();
  }, []);

  useEffect(() => {
    const fetchPositions = async () => {
      const onlineTles = await fetchTles(3);
      if (onlineTles) {
        console.log("Calculating TLEs...");
        const dotsList = await calculateBatchTlePositions(onlineTles, 80);
        console.log('Setting positions list...', dotsList);
        setSatelliteData(dotsList.flatMap(([positions]) => positions));
      }
    };

    fetchPositions().then();
  }, []);

  useEffect(() => {
    console.log('Satellite data updated', satelliteData);
  }, [satelliteData]);

  const satObject = useMemo(() => {
    const satGeometry = new THREE.SphereGeometry(0.1); // Small sphere
    const satMaterial = new THREE.MeshLambertMaterial({ color: 'red' });
    return new THREE.Mesh(satGeometry, satMaterial);
  }, []);

  return (
    <div>
      <Globe
        ref={globeEl}
        globeImageUrl="world-map.webp"
        objectsData={satelliteData}
        objectLabel="name"
        objectLat="lat"
        objectLng="lng"
        objectAltitude="alt"
        objectFacesSurfaces={false}
        objectThreeObject={() => satObject.clone()}
      />
      <div id="time-log">{time.toString()}</div>
    </div>
  );
}
