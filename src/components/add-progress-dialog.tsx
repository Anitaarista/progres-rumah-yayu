'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Upload, X, ImageIcon, Lock } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PHASES = [
  'Persiapan',
  'Pondasi',
  'Struktur',
  'Dinding',
  'Atap',
  'Finishing',
  'Eksterior',
  'Interior',
  'Lainnya',
]

const schema = z.object({
  title: z
    .string()
    .min(3, 'Judul minimal 3 karakter')
    .max(120, 'Judul terlalu panjang'),
  description: z
    .string()
    .min(10, 'Deskripsi minimal 10 karakter')
    .max(1000, 'Deskripsi terlalu panjang'),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  phase: z.string().min(1, 'Fase wajib dipilih'),
  progress: z.number().min(0).max(100),
  location: z.string().max(120).optional(),
  notes: z.string().max(500).optional(),
  password: z.string().min(1, 'Password wajib diisi'),
})

type FormValues = z.infer<typeof schema>

interface AddProgressDialogProps {
  onCreated: () => void
  trigger?: React.ReactNode
}

export function AddProgressDialog({ onCreated, trigger }: AddProgressDialogProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      // Default tanggal = hari ini (format YYYY-MM-DD)
      date: new Date().toISOString().slice(0, 10),
      phase: 'Persiapan',
      progress: 0,
      location: '',
      notes: '',
      password: '',
    },
  })

  const progress = watch('progress')
  const phase = watch('phase')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(f ? URL.createObjectURL(f) : null)
  }

  const resetForm = () => {
    reset({
      title: '',
      description: '',
      date: new Date().toISOString().slice(0, 10),
      phase: 'Persiapan',
      progress: 0,
      location: '',
      notes: '',
      password: '',
    })
    setFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  const onSubmit = async (values: FormValues) => {
    if (!file) {
      toast.error('Foto 360 wajib diupload')
      return
    }
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('description', values.description)
      formData.append('date', values.date)
      formData.append('phase', values.phase)
      formData.append('progress', String(values.progress))
      formData.append('location', values.location ?? '')
      formData.append('notes', values.notes ?? '')
      formData.append('password', values.password)
      formData.append('file', file)

      const res = await fetch('/api/progress', {
        method: 'POST',
        body: formData,
        headers: {
          'x-upload-password': values.password,
        },
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 401) {
          throw new Error('Password salah. Upload ditolak.')
        }
        throw new Error(data?.error || 'Gagal menyimpan')
      }

      toast.success('Entri progres berhasil ditambahkan')
      resetForm()
      setOpen(false)
      onCreated()
    } catch (e) {
      console.error(e)
      toast.error(
        e instanceof Error ? e.message : 'Gagal menambahkan entri progres'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) resetForm()
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Tambah Progres
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Tambah Progres Baru</DialogTitle>
          <DialogDescription>
            Upload foto panorama 360° dan lengkapi detail tahap pembangunan.
            Tanggal otomatis diisi hari ini.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Upload file */}
          <div className="space-y-2">
            <Label>Foto Panorama 360° *</Label>
            <label
              htmlFor="pano-file"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-6 text-center transition hover:border-primary hover:bg-muted/70"
            >
              {previewUrl ? (
                <div className="relative w-full">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-40 w-full rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setFile(null)
                      if (previewUrl) URL.revokeObjectURL(previewUrl)
                      setPreviewUrl(null)
                    }}
                    className="absolute right-2 top-2 rounded-full bg-background/90 p-1 shadow ring-1 ring-border hover:bg-background"
                    aria-label="Hapus file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background ring-1 ring-border">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-primary">
                      Klik untuk upload
                    </span>{' '}
                    atau drag & drop
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Format equirectangular .jpg / .png / .webp (rasio 2:1)
                  </p>
                </>
              )}
              <input
                id="pano-file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Judul *</Label>
            <Input
              id="title"
              placeholder="cth. Galian Pondasi & Footing"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal *</Label>
              <Input id="date" type="date" {...register('date')} />
              <p className="text-[11px] text-muted-foreground">
                Otomatis hari ini — bisa diubah.
              </p>
              {errors.date && (
                <p className="text-xs text-destructive">
                  {errors.date.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phase">Fase *</Label>
              <Select
                value={phase}
                onValueChange={(v) => setValue('phase', v, { shouldValidate: true })}
              >
                <SelectTrigger id="phase">
                  <SelectValue placeholder="Pilih fase" />
                </SelectTrigger>
                <SelectContent>
                  {PHASES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.phase && (
                <p className="text-xs text-destructive">
                  {errors.phase.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="progress">Progress (%)</Label>
              <span className="text-sm font-semibold tabular-nums">
                {progress}%
              </span>
            </div>
            <Slider
              id="progress"
              value={[progress]}
              min={0}
              max={100}
              step={5}
              onValueChange={(v) => setValue('progress', v[0] ?? 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lokasi Titik (opsional)</Label>
            <Input
              id="location"
              placeholder="cth. Titik 3 — Ruang Tamu"
              {...register('location')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi *</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Jelaskan progres pekerjaan, material, kendala, dll."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="cth. Cuaca, mandor, target minggu depan, dll."
              {...register('notes')}
            />
          </div>

          {/* Password field */}
          <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
            <Label htmlFor="password" className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" />
              Password Upload *
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Masukkan password untuk upload"
              autoComplete="off"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Hanya pemilik yang dapat menambah dokumentasi.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan…
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

