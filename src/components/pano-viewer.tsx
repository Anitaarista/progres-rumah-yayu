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
  // loading dimulai `true` — saat imageUrl berubah, komponen di-remount
  // lewat key, jadi state loading sudah benar dari awal tanpa setState di effect.
  const [loading, setLoading] = useState(true)
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
      autorotateDelay: 2000,
      autorotateSpeed: '0.5rpm',
      autorotateZoomLvl: 0,
      moveSpeed: 1.2,
      moveInertia: true,
      mousemove: true,
      mousewheel: true,
      navbar: navBtns,
      canvasBackground: 'oklch(0.97 0 0)',
    }

    try {
      const viewer = new Viewer(config)
      viewerRef.current = viewer

      viewer.once('ready', () => {
        if (cancelled) return
        setLoading(false)
      })

      viewer.once('panorama-loaded', () => {
        if (cancelled) return
        setLoading(false)
      })

      viewer.on('load-error', () => {
        if (cancelled) return
        setError('Gagal memuat foto panorama. Periksa URL/format gambar.')
        setLoading(false)
      })
    } catch (e) {
      console.error('PanoViewer init error', e)
      setError('Gagal menginisialisasi viewer.')
      setLoading(false)
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
    <div className="relative w-full overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
      <div
        ref={containerRef}
        className="w-full"
        style={{ height: 'min(72vh, 640px)', minHeight: 380 }}
        aria-label={`Panorama 360°: ${title ?? 'progres rumah'}`}
        role="img"
      />

      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Memuat panorama 360°…
          </p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 p-6 text-center backdrop-blur-sm">
          <div className="text-3xl">⚠️</div>
          <p className="max-w-sm text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground ring-1 ring-border backdrop-blur">
        360° Panorama
      </div>
    </div>
  )
}

export default function PanoViewer(props: PanoViewerProps) {
  // Remount tiap kali panorama berubah → loading otomatis true tanpa setState di effect
  return <PanoViewerImpl key={props.imageUrl} {...props} />
}
