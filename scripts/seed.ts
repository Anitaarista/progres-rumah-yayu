/**
 * Seed script untuk mengisi database dengan sample data progres rumah.
 * Pakai foto 360° asli Yayu (PXL_20260618_115212877.PHOTOSPHERE.jpg)
 * Run: bun run /home/z/my-project/scripts/seed.ts
 */
import { db } from '../src/lib/db'

async function main() {
  // Bersihkan data lama
  await db.progressEntry.deleteMany({})

  const today = new Date()

  const samples = [
    {
      title: 'Dokumentasi Pertama — Foto 360° Lahan',
      description:
        'Foto panorama 360° pertama yang diambil menggunakan ponsel Pixel (mode PhotoSphere). Menampilkan kondisi awal lokasi sebelum dimulainya pekerjaan fisik. Foto ini menjadi baseline perbandingan untuk seluruh tahap pembangunan berikutnya — setiap entri progres berikutnya dapat dibandingkan dari titik pandang yang sama untuk mengukur perubahan secara visual. Klik dan drag pada gambar untuk memutar pandangan ke segala arah.',
      date: today,
      imageUrl: '/uploads/progress/pano-yayu-day1.jpg',
      phase: 'Persiapan',
      progress: 5,
      location: 'Titik 1 — Tampak Depan',
      notes:
        'Foto diambil menggunakan Pixel PhotoSphere mode. Cuaca cerah, akses jalan baik.',
    },
  ]

  for (const entry of samples) {
    await db.progressEntry.create({ data: entry })
  }

  console.log(`✓ Seeded ${samples.length} progress entries`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
