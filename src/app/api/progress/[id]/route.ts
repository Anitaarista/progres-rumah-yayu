import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { unlink } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// DELETE /api/progress/[id]  — header: x-upload-password
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // === Validasi password ===
    const headerPass = req.headers.get('x-upload-password') || ''
    const expectedPassword = process.env.UPLOAD_PASSWORD || 'upload'
    if (headerPass !== expectedPassword) {
      return NextResponse.json(
        { error: 'Password salah. Akses ditolak.' },
        { status: 401 }
      )
    }

    const { id } = await params
    const entry = await db.progressEntry.findUnique({ where: { id } })
    if (!entry) {
      return NextResponse.json(
        { error: 'Entri tidak ditemukan' },
        { status: 404 }
      )
    }

    // Hapus file lokal jika bukan URL remote
    if (entry.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', entry.imageUrl)
      try {
        await unlink(filePath)
      } catch {
        // ignore if file not found
      }
    }

    await db.progressEntry.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/progress/[id] error', err)
    return NextResponse.json(
      { error: 'Gagal menghapus entri' },
      { status: 500 }
    )
  }
}
