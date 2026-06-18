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

// Foto 360° Yayu diserve dari ImageKit CDN.
// Transformasi: w-4096 (rasio 2:1 → 2048 tinggi), q-80, f-auto (AVIF/WebP otomatis).
// Ukuran turun dari 11 MB → ±2 MB tanpa kehilangan detail yang terlihat.
const PANORAMA_URL =
  'https://ik.imagekit.io/6m8emwpnx/tr:w-4096,q-80,f-auto/PXL_20260618_115212877.PHOTOSPHERE.jpg'

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
