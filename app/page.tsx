import dynamic from "next/dynamic";

const Map = dynamic(() => import('@/app/ui/map'), {ssr: false})

export default function HomePage() {
  return <Map/>
}
