import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/progress — daftar semua entri progres
export async function GET() {
  try {
    const entries = await db.progressEntry.findMany({
      orderBy: { date: 'asc' },
    })
    return NextResponse.json({ entries })
  } catch (err) {
    console.error('GET /api/progress error', err)
    return NextResponse.json(
      { error: 'Gagal memuat data progres' },
      { status: 500 }
    )
  }
}

// POST /api/progress — tambah entri baru (multipart/form-data)
// Header: x-upload-password = "upload"  (atau field "password" di FormData)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    // === Validasi password ===
    const headerPass = req.headers.get('x-upload-password') || ''
    const fieldPass = String(formData.get('password') || '').trim()
    const providedPassword = headerPass || fieldPass
    const expectedPassword = process.env.UPLOAD_PASSWORD || 'upload'

    if (providedPassword !== expectedPassword) {
      return NextResponse.json(
        { error: 'Password salah. Upload ditolak.' },
        { status: 401 }
      )
    }

    const title = String(formData.get('title') || '').trim()
    const description = String(formData.get('description') || '').trim()
    const dateStr = String(formData.get('date') || '').trim()
    const phase = String(formData.get('phase') || 'Lainnya').trim()
    const progressRaw = Number(formData.get('progress') || 0)
    const location = String(formData.get('location') || '').trim()
    const notes = String(formData.get('notes') || '').trim()
    const file = formData.get('file') as File | null

    if (!title) {
      return NextResponse.json(
        { error: 'Judul wajib diisi' },
        { status: 400 }
      )
    }
    if (!dateStr) {
      return NextResponse.json(
        { error: 'Tanggal wajib diisi' },
        { status: 400 }
      )
    }
    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: 'Foto 360 wajib diupload' },
        { status: 400 }
      )
    }

    const progress = Math.max(
      0,
      Math.min(100, isNaN(progressRaw) ? 0 : progressRaw)
    )

    // Simpan file ke /public/uploads/progress/
    const uploadsDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'progress'
    )
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const ext = path.extname(file.name) || '.jpg'
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(
      ext.toLowerCase()
    )
      ? ext.toLowerCase()
      : '.jpg'
    const fileName = `pano-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}${safeExt}`
    const filePath = path.join(uploadsDir, fileName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)
    const imageUrl = `/uploads/progress/${fileName}`

    const entry = await db.progressEntry.create({
      data: {
        title,
        description,
        date: new Date(dateStr),
        imageUrl,
        phase,
        progress,
        location: location || null,
        notes: notes || null,
      },
    })

    return NextResponse.json({ entry }, { status: 201 })
  } catch (err) {
    console.error('POST /api/progress error', err)
    return NextResponse.json(
      { error: 'Gagal menyimpan entri progres' },
      { status: 500 }
    )
  }
}
