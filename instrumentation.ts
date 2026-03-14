export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { execSync } = await import('child_process')
    const fs = await import('fs')
    const path = await import('path')

    const dbUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
    const dbRelPath = dbUrl.replace(/^file:/, '')
    const dbAbsPath = path.resolve(process.cwd(), dbRelPath)
    const dbExists = fs.existsSync(dbAbsPath)

    if (!dbExists) {
      console.log(
        '[DB] Database file not found, running prisma migrate deploy...'
      )
    } else {
      console.log('[DB] Database found, applying pending migrations...')
    }

    const prismaBin = path.join(process.cwd(), 'node_modules', '.bin', 'prisma')

    try {
      execSync(`"${prismaBin}" migrate deploy`, {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: process.env,
        timeout: 60000,
      })
      console.log('[DB] Migrations applied successfully.')
    } catch (err) {
      console.error(
        '[DB] Migration failed. Visit /setup to initialize manually.',
        err
      )
    }
  }
}
