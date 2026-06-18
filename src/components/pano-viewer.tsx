'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useRef, useState } from 'react'
import { Viewer, type ViewerConfig } from '@photo-sphere-viewer/core'
import { GalleryPlugin, type GalleryItem } from '@photo-sphere-viewer/gallery-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/gallery-plugin/index.css'
import type { PanoPhoto } from '@/data/photos'

interface PanoViewerProps {
  photos: PanoPhoto[]
  defaultIndex?: number
  onIndexChange?: (index: number) => void
}

function PanoViewerImpl({
  photos,
  defaultIndex = 0,
  onIndexChange,
}: PanoViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    if (photos.length === 0) return
    let cancelled = false

    // Cleanup instance sebelumnya
    if (viewerRef.current) {
      try {
        viewerRef.current.destroy()
      } catch {
        /* ignore */
      }
      viewerRef.current = null
    }

    const startIndex = Math.max(0, Math.min(defaultIndex, photos.length - 1))
    const startPhoto = photos[startIndex]

    const galleryItems: GalleryItem[] = photos.map((p) => ({
      id: p.id,
      panorama: p.url,
      thumbnail: p.thumbnail,
      // name dikosongkan agar tidak ada caption di thumbnail
      name: '',
      options: {
        // caption viewer juga dikosongkan
        caption: '',
      },
    }))

    const config: ViewerConfig = {
      container: containerRef.current,
      panorama: startPhoto.url,
      loadingTxt: 'Memuat panorama 360°…',
      defaultZoomLvl: 0,
      minFov: 40,
      maxFov: 90,
      autorotateIdle: true,
      autorotateDelay: 1500,
      autorotateSpeed: '0.5rpm',
      autorotateZoomLvl: 0,
      moveSpeed: 1.2,
      moveInertia: true,
      mousemove: true,
      mousewheel: true,
      // Navbar tanpa 'caption' karena tidak ada judul yang ditampilkan
      navbar: [
        'zoom',
        'move',
        'download',
        'fullscreen',
        'autorotate',
        'gallery',
      ],
      canvasBackground: '#000000',
      plugins: [
        [
          GalleryPlugin,
          {
            visibleOnLoad: true,
            thumbnailSize: { width: 140, height: 80 },
            items: galleryItems,
          },
        ],
      ],
    }

    try {
      const viewer = new Viewer(config)
      viewerRef.current = viewer

      // Notifikasi parent saat user pilih thumbnail lain
      viewer.addEventListener(
        'gallery:updated',
        (e: { item: { id: string | number } }) => {
          if (cancelled) return
          const idx = photos.findIndex((p) => p.id === String(e.item.id))
          if (idx >= 0) onIndexChange?.(idx)
        }
      )

      viewer.addEventListener('load-error', () => {
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
  }, [photos, defaultIndex, onIndexChange])

  // Set index awal ketika photos pertama kali dimuat
  useEffect(() => {
    if (defaultIndex >= 0 && defaultIndex < photos.length) {
      onIndexChange?.(defaultIndex)
    }
    // run once on mount
  }, [])

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-black">
      <div
        ref={containerRef}
        className="h-full w-full"
        aria-label="Panorama 360° Progres Rumah Yayu"
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
  // Remount tiap kali array photos berubah
  return (
    <PanoViewerImpl
      key={props.photos.map((p) => p.id).join('|')}
      {...props}
    />
  )
}
