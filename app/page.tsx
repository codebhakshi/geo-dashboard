'use client'

import { useCallback, useState } from "react";
import { LayerConfig } from "@/types/index"
import SideBar from "@/components/SideBar"
import MapView from "@/components/MapView";

export default function Home(){
    const [layers, setLayers] = useState <LayerConfig[]>([])

    const handleLayersChange = useCallback( (newlayers: LayerConfig[]) => {
        setLayers(newlayers)
    },[ ])

    return (
        <main className="flex h-screen w-screen overflow-hidden bg-[#080818]">
            <SideBar onLayersChange={handleLayersChange} />
        <div className="flex-1 relative">
            <MapView layers={layers} />
        </div>
        </main>
  );
}