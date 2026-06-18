'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useRef, useState } from 'react'
import { Viewer, type ViewerOptions } from 'photo-sphere-viewer'
import 'photo-sphere-viewer/dist/photo-sphere-viewer.css'

interface PanoViewerProps {
  imageUrl: string
  title?: string
  caption?: string
  description?: string
  autoRotate?: boolean
}

function PanoViewerImpl({
  imageUrl,
  title,
  caption,
  description,
  autoRotate = true,
}: PanoViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false

    if (viewerRef.current) {
      try {
        viewerRef.current.destroy()
      } catch {
        /* ignore */
      }
      viewerRef.current = null
    }

    const navBtns = [
      'zoom',
      'move',
      'caption',
      'download',
      'fullscreen',
      'autorotate',
    ]

    const config: ViewerOptions = {
      container: containerRef.current,
      panorama: imageUrl,
      caption: caption ?? title,
      description: description,
      loadingTxt: 'Memuat panorama 360°…',
      defaultZoomLvl: 0,
      minFov: 40,
      maxFov: 90,
      autorotateIdle: autoRotate,
      autorotateDelay: 1500,
      autorotateSpeed: '0.5rpm',
      autorotateZoomLvl: 0,
      moveSpeed: 1.2,
      moveInertia: true,
      mousemove: true,
      mousewheel: true,
      navbar: navBtns,
      canvasBackground: '#000000',
    }

    try {
      const viewer = new Viewer(config)
      viewerRef.current = viewer

      viewer.on('load-error', () => {
        if (cancelled) return
        setError('Gagal memuat foto panorama. Periksa URL/format gambar.')
      })
    } catch (e) {
      console.error('PanoViewer init error', e)
      setError('Gagal menginisialisasi viewer.')
    }

    return () => {
      cancelled = true
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy()
        } catch {
          /* ignore */
        }
        viewerRef.current = null
      }
    }
  }, [imageUrl, title, caption, description, autoRotate])

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-black">
      <div
        ref={containerRef}
        className="h-full w-full"
        aria-label={`Panorama 360°: ${title ?? 'progres rumah yayu'}`}
        role="img"
      />

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/90 p-6 text-center">
          <div className="text-3xl">⚠️</div>
          <p className="max-w-sm text-sm text-red-300">{error}</p>
        </div>
      )}
    </div>
  )
}

export default function PanoViewer(props: PanoViewerProps) {
  // Remount tiap kali panorama berubah
  return <PanoViewerImpl key={props.imageUrl} {...props} />
}
