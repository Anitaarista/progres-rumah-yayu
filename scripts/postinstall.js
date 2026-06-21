#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Postinstall script: patch @photo-sphere-viewer/core untuk menggunakan
 * `three` sebagai peerDependency (bukan regular dependency), supaya
 * bun/npm tidak install nested three.js di
 * node_modules/@photo-sphere-viewer/core/node_modules/three.
 *
 * Tanpa patch ini, PSV core & root three.js jadi 2 instance berbeda →
 * viewer throw "Multiple instances of Three.js being imported" dan
 * panorama kedua/ketiga gagal render (canvas hitam).
 */
const fs = require('fs')
const path = require('path')

const target = path.join(
  process.cwd(),
  'node_modules/@photo-sphere-viewer/core/package.json'
)

if (!fs.existsSync(target)) {
  console.log('[postinstall] PSV core not found, skipping patch')
  process.exit(0)
}

const pkg = JSON.parse(fs.readFileSync(target, 'utf8'))

if (
  pkg.dependencies &&
  pkg.dependencies.three &&
  (!pkg.peerDependencies || !pkg.peerDependencies.three)
) {
  const ver = pkg.dependencies.three
  delete pkg.dependencies.three
  pkg.peerDependencies = pkg.peerDependencies || {}
  pkg.peerDependencies.three = ver
  fs.writeFileSync(target, JSON.stringify(pkg, null, 2))
  console.log(
    `[postinstall] Patched @photo-sphere-viewer/core: three moved to peerDependencies (${ver})`
  )
} else {
  console.log('[postinstall] PSV core already patched, no action')
}

// Hapus nested three jika ada (cleanup)
const nestedThree = path.join(
  process.cwd(),
  'node_modules/@photo-sphere-viewer/core/node_modules/three'
)
if (fs.existsSync(nestedThree)) {
  fs.rmSync(nestedThree, { recursive: true, force: true })
  console.log('[postinstall] Removed nested three.js at', nestedThree)
}
