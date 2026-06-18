'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { PHOTOS, DEFAULT_INDEX } from '@/data/photos'

const PanoViewer = dynamic(() => import('@/components/pano-viewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[100svh] w-full items-center justify-center bg-black">
      <Loader2 className="h-10 w-10 animate-spin text-white/70" />
    </div>
  ),
})

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(
    DEFAULT_INDEX >= 0 ? DEFAULT_INDEX : 0
  )

  const activePhoto = useMemo(
    () => (activeIndex >= 0 && activeIndex < PHOTOS.length ? PHOTOS[activeIndex] : null),
    [activeIndex]
  )

  if (PHOTOS.length === 0) {
    return (
      <main className="flex min-h-[100svh] w-full items-center justify-center bg-black p-6 text-center">
        <div>
          <p className="text-lg font-semibold text-white">Belum ada foto</p>
          <p className="mt-2 text-sm text-white/60">
            Tambahkan entri di{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
              src/data/photos.ts
            </code>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="relative flex min-h-[100svh] w-full flex-col bg-black">
      {/* Header overlay — hanya nama + tanggal + counter */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/70 to-transparent px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-white sm:text-xl">
            Progres Rumah Yayu
          </h1>
          {activePhoto && (
            <p className="text-sm text-white/70">
              {format(parseISO(activePhoto.date), 'EEEE, d MMMM yyyy', {
                locale: idLocale,
              })}
              <span className="mx-2 text-white/30">·</span>
              <span className="tabular-nums">
                {activeIndex + 1} / {PHOTOS.length}
              </span>
            </p>
          )}
        </div>
      </header>

      {/* Viewer 360° */}
      <div className="w-full flex-1">
        <PanoViewer
          photos={PHOTOS}
          defaultIndex={activeIndex}
          onIndexChange={setActiveIndex}
        />
      </div>
    </main>
  )
}
