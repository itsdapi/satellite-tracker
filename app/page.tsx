'use client'

import Earth from "@/app/ui/earth";
import Controller from "@/app/ui/controller";
import {ActiveSatProvider} from "@/app/lib/context/active-sat-content";

export default function Home() {
  return (
    <main className={'w-screen h-screen'}>
      <ActiveSatProvider>
        <Controller/>
        <Earth/>
      </ActiveSatProvider>
    </main>
  );
}
