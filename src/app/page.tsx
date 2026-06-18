'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Building2,
  CalendarDays,
  HardHat,
  House,
  Moon,
  Plus,
  RefreshCw,
  Sun,
  Trash2,
  MapPin,
  TrendingUp,
  Hammer,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { format, parseISO, differenceInDays } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { AddProgressDialog } from '@/components/add-progress-dialog'

// Photo Sphere Viewer memerlukan three.js → client-only
const PanoViewer = dynamic(() => import('@/components/pano-viewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[480px] w-full items-center justify-center rounded-2xl bg-muted">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

interface ProgressEntry {
  id: string
  title: string
  description: string
  date: string
  imageUrl: string
  phase: string
  progress: number
  location: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

const PHASE_COLOR: Record<string, string> = {
  Persiapan:
    'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200',
  Pondasi:
    'bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-200',
  Struktur:
    'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200',
  Dinding:
    'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200',
  Atap: 'bg-sky-100 text-sky-900 dark:bg-sky-950/60 dark:text-sky-200',
  Finishing:
    'bg-violet-100 text-violet-900 dark:bg-violet-950/60 dark:text-violet-200',
  Eksterior:
    'bg-teal-100 text-teal-900 dark:bg-teal-950/60 dark:text-teal-200',
  Interior:
    'bg-fuchsia-100 text-fuchsia-900 dark:bg-fuchsia-950/60 dark:text-fuchsia-200',
  Lainnya:
    'bg-slate-100 text-slate-900 dark:bg-slate-800/60 dark:text-slate-200',
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="h-9 w-9" />
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Ganti tema"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}

export default function Home() {
  const [entries, setEntries] = useState<ProgressEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/progress', { cache: 'no-store' })
      if (!res.ok) throw new Error('Gagal memuat data')
      const data = await res.json()
      const list: ProgressEntry[] = data.entries ?? []
      setEntries(list)
      if (list.length > 0 && !activeId) {
        setActiveId(list[list.length - 1].id)
      }
    } catch (e) {
      console.error(e)
      setError('Gagal memuat data progres. Coba refresh halaman.')
    } finally {
      setLoading(false)
    }
  }, [activeId])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const active = useMemo(
    () => entries.find((e) => e.id === activeId) ?? null,
    [entries, activeId]
  )

  const stats = useMemo(() => {
    if (entries.length === 0) {
      return { total: 0, latestProgress: 0, latestDate: null, daysSpan: 0 }
    }
    const latest = entries[entries.length - 1]
    const first = entries[0]
    const daysSpan = differenceInDays(
      parseISO(latest.date),
      parseISO(first.date)
    )
    return {
      total: entries.length,
      latestProgress: latest.progress,
      latestDate: latest.date,
      latestPhase: latest.phase,
      daysSpan,
    }
  }, [entries])

  const handleDelete = async (id: string) => {
    const prev = entries
    const next = prev.filter((e) => e.id !== id)
    setEntries(next)
    if (activeId === id) {
      setActiveId(next.length > 0 ? next[next.length - 1].id : null)
    }
    try {
      // Minta password sebelum hapus
      const password = window.prompt(
        'Masukkan password untuk menghapus entri:'
      )
      if (!password) {
        // user cancel → restore
        setEntries(prev)
        return
      }
      const res = await fetch(`/api/progress/${id}`, {
        method: 'DELETE',
        headers: { 'x-upload-password': password },
      })
      if (!res.ok) {
        if (res.status === 401) throw new Error('Password salah.')
        throw new Error('Gagal menghapus')
      }
      toast.success('Entri dihapus')
    } catch (e) {
      console.error(e)
      setEntries(prev)
      toast.error(e instanceof Error ? e.message : 'Gagal menghapus entri')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <House className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight tracking-tight sm:text-lg">
                Progres Rumah Yayu
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Dokumentasi 360° pembangunan rumah
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchEntries}
              aria-label="Muat ulang"
              title="Muat ulang"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <AddProgressDialog
              onCreated={fetchEntries}
              trigger={
                <Button className="hidden sm:inline-flex">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Progres
                </Button>
              }
            />
            <AddProgressDialog onCreated={fetchEntries}>
              <Button size="icon" className="sm:hidden" aria-label="Tambah">
                <Plus className="h-4 w-4" />
              </Button>
            </AddProgressDialog>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Hero / Stats */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="overflow-hidden">
            <CardContent className="flex items-start gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HardHat className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Total Dokumentasi
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {loading ? '—' : stats.total}
                </p>
                <p className="text-xs text-muted-foreground">
                  entri panorama 360°
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Progres Terbaru
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {loading ? '—' : `${stats.latestProgress}%`}
                </p>
                <Progress
                  value={stats.latestProgress}
                  className="mt-1.5 h-1.5"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Hammer className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Fase Saat Ini
                </p>
                <p className="truncate text-lg font-bold leading-tight">
                  {loading ? '—' : stats.latestPhase ?? 'Belum ada'}
                </p>
                <p className="text-xs text-muted-foreground">
                  dari {stats.total} entri tercatat
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Update Terakhir
                </p>
                <p className="truncate text-lg font-bold leading-tight">
                  {loading || !stats.latestDate
                    ? '—'
                    : format(parseISO(stats.latestDate), 'd MMM yyyy', {
                        locale: idLocale,
                      })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stats.daysSpan > 0
                    ? `${stats.daysSpan} hari sejak awal`
                    : 'belum berjalan'}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={fetchEntries}
            >
              Coba lagi
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Viewer + active entry details */}
          <section className="lg:col-span-8">
            {loading ? (
              <Skeleton className="h-[480px] w-full rounded-2xl" />
            ) : active ? (
              <div className="space-y-4">
                <PanoViewer
                  imageUrl={active.imageUrl}
                  title={active.title}
                  caption={`${active.title} — ${format(
                    parseISO(active.date),
                    'd MMM yyyy',
                    { locale: idLocale }
                  )}`}
                  description={active.description}
                />

                <Card>
                  <CardContent className="p-5 sm:p-6">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge
                            className={
                              PHASE_COLOR[active.phase] ?? PHASE_COLOR.Lainnya
                            }
                          >
                            {active.phase}
                          </Badge>
                          {active.location && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {active.location}
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                          {active.title}
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {format(parseISO(active.date), 'EEEE, d MMMM yyyy', {
                            locale: idLocale,
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          Progres
                        </p>
                        <p className="text-2xl font-bold tabular-nums text-primary">
                          {active.progress}%
                        </p>
                      </div>
                    </div>

                    <Progress value={active.progress} className="h-2" />

                    <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                      {active.description}
                    </p>

                    {active.notes && (
                      <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Catatan
                        </p>
                        <p className="mt-1 text-sm text-foreground/80">
                          {active.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex h-[480px] flex-col items-center justify-center gap-3 p-6 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-semibold">
                      Belum ada dokumentasi
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Mulai dokumentasi pembangunan dengan menambahkan foto
                      panorama 360° pertama Anda.
                    </p>
                  </div>
                  <AddProgressDialog onCreated={fetchEntries} />
                </CardContent>
              </Card>
            )}
          </section>

          {/* Timeline */}
          <aside className="lg:col-span-4">
            <Card className="flex h-full flex-col">
              <CardContent className="flex flex-col p-0">
                <div className="border-b border-border/80 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Timeline Progres
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {entries.length} entri tercatat — klik untuk melihat
                  </p>
                </div>

                {loading ? (
                  <div className="space-y-3 p-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full rounded-lg" />
                    ))}
                  </div>
                ) : entries.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Belum ada entri.
                  </div>
                ) : (
                  <ScrollArea className="max-h-[640px]">
                    <ol className="relative space-y-1 p-3">
                      {entries
                        .slice()
                        .reverse()
                        .map((entry, idx) => {
                          const isActive = entry.id === activeId
                          return (
                            <li key={entry.id} className="relative">
                              <button
                                onClick={() => setActiveId(entry.id)}
                                className={`group flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition ${
                                  isActive
                                    ? 'bg-primary/5 ring-1 ring-primary/30'
                                    : 'hover:bg-muted/60'
                                }`}
                              >
                                <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-border">
                                  <img
                                    src={entry.imageUrl}
                                    alt={entry.title}
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      ;(e.target as HTMLImageElement).style.opacity = '0.3'
                                    }}
                                  />
                                  <span className="absolute right-1 top-1 rounded bg-background/80 px-1 py-0.5 text-[10px] font-medium backdrop-blur">
                                    360°
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                        isActive
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-muted-foreground/15 text-muted-foreground'
                                      }`}
                                    >
                                      {entries.length - idx}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`px-1.5 py-0 text-[10px] font-medium ${
                                        PHASE_COLOR[entry.phase] ??
                                        PHASE_COLOR.Lainnya
                                      } border-transparent`}
                                    >
                                      {entry.phase}
                                    </Badge>
                                  </div>
                                  <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug">
                                    {entry.title}
                                  </p>
                                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <CalendarDays className="h-3 w-3" />
                                    {format(parseISO(entry.date), 'd MMM yyyy', {
                                      locale: idLocale,
                                    })}
                                    <span className="mx-1">·</span>
                                    <span className="font-semibold text-foreground">
                                      {entry.progress}%
                                    </span>
                                  </p>
                                </div>
                              </button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button
                                    className="absolute right-1.5 top-1.5 hidden rounded-md p-1 text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive group-hover:block"
                                    aria-label="Hapus entri"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Hapus entri ini?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Entri &ldquo;{entry.title}&rdquo; akan
                                      dihapus permanen beserta fotonya. Aksi ini
                                      tidak bisa dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Batal
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(entry.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </li>
                          )
                        })}
                    </ol>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <footer className="mt-auto border-t border-border/80 bg-muted/30">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>
            Progres Rumah Yayu &middot; Dokumentasi virtual 360° pembangunan
            rumah
          </p>
          <p>
            Dibangun dengan Next.js + Photo Sphere Viewer &middot;{' '}
            <span className="font-medium text-foreground/80">
              {format(new Date(), 'yyyy')}
            </span>
          </p>
        </div>
      </footer>
    </div>
  )
}
