/**
 * setup-uploads.cjs
 * Runs before `next start`. If UPLOAD_DIR env var is set (production),
 * creates a symlink from public/uploads → UPLOAD_DIR so uploaded files
 * survive across deployments. Falls back to creating the local folder
 * for local development.
 */
const { mkdirSync, symlinkSync, rmSync } = require('fs')
const path = require('path')

const uploadDir = process.env.UPLOAD_DIR
const localUploads = path.join(process.cwd(), 'public', 'uploads')

if (uploadDir) {
  // Ensure persistent directory exists on the server
  mkdirSync(uploadDir, { recursive: true })

  // Remove existing public/uploads (file, dir, or stale symlink) - ignore if not found
  try {
    rmSync(localUploads, { recursive: true, force: true })
  } catch (_) {}

  symlinkSync(uploadDir, localUploads, 'dir')
  console.log(`✅ Uploads symlinked: public/uploads → ${uploadDir}`)
} else {
  // Local dev: just make sure the folder exists
  mkdirSync(localUploads, { recursive: true })
  console.log('✅ Local uploads directory ready')
}
