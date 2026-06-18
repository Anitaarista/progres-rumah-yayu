'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Photo Sphere Viewer membutuhkan three.js → client-only
const PanoViewer = dynamic(() => import('@/components/pano-viewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[100svh] w-full items-center justify-center bg-black">
      <Loader2 className="h-10 w-10 animate-spin text-white/70" />
    </div>
  ),
})

const PANORAMA_URL = '/uploads/progress/pano-yayu-day1.jpg'

export default function Home() {
  return (
    <main className="flex min-h-[100svh] w-full items-stretch bg-black">
      <div className="w-full">
        <PanoViewer
          imageUrl={PANORAMA_URL}
          title="Progres Rumah Yayu"
          autoRotate
        />
      </div>
    </main>
  )
}
