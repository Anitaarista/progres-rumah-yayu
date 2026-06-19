/**
 * Daftar foto panorama 360° Progres Rumah Yayu.
 *
 * Cara menambah entri baru:
 * 1. Upload foto ke ImageKit (dashboard.imagekit.io)
 * 2. Tambah objek baru di array PHOTOS di bawah, dengan:
 *    - id       : unik (bebas string)
 *    - date     : tanggal ambil foto (format YYYY-MM-DD)
 *    - url      : URL ImageKit dengan transformasi optimasi (w-4096, q-80, f-auto)
 *    - thumbnail: URL ImageKit versi kecil untuk thumbnail gallery (w-400, q-70)
 *
 * Urutan = urutan tampil di gallery. PsViewer akan otomatis mulai dari index 0.
 */

export interface PanoPhoto {
  id: string
  date: string // YYYY-MM-DD
  url: string
  thumbnail: string
}

// Helper: bangun URL ImageKit dengan transformasi yang konsisten
const ikBase = 'https://ik.imagekit.io/6m8emwpnx'
const ik = (path: string, transform: string) =>
  `${ikBase}/tr:${transform}/${path}`

export const PHOTOS: PanoPhoto[] = [
  {
    id: 'day-1',
    date: '2026-06-18',
    url: ik('PXL_20260618_115212877.PHOTOSPHERE.jpg', 'w-4096,q-80,f-auto'),
    thumbnail: ik(
      'PXL_20260618_115212877.PHOTOSPHERE.jpg',
      'w-400,h-200,fo-auto,q-70,f-auto'
    ),
  },
  {
    id: 'day-2',
    date: '2026-06-19',
    url: ik('PXL_20260619_104535974.PHOTOSPHERE.jpg', 'w-4096,q-80,f-auto'),
    thumbnail: ik(
      'PXL_20260619_104535974.PHOTOSPHERE.jpg',
      'w-400,h-200,fo-auto,q-70,f-auto'
    ),
  },
  // ─── CONTOH ENTRI BERIKUTNYA ─────────────────────────────────────────
  // Tinggal copy-paste blok di bawah, ganti path file + tanggal.
  //
  // {
  //   id: 'day-3',
  //   date: '2026-11-12',
  //   url: ik('NAMA_FILE_LAIN.jpg', 'w-4096,q-80,f-auto'),
  //   thumbnail: ik('NAMA_FILE_LAIN.jpg', 'w-400,h-200,fo-auto,q-70,f-auto'),
  // },
]

// Default index (foto yang muncul pertama saat load)
export const DEFAULT_INDEX = PHOTOS.length > 0 ? 0 : -1
