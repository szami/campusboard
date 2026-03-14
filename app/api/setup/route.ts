import { execSync } from 'child_process'
import fs from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

export const dynamic = 'force-dynamic'

function getDbPath(): string {
  const url = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
  const rel = url.replace(/^file:/, '')
  return path.resolve(process.cwd(), rel)
}

export async function GET() {
  const dbPath = getDbPath()
  const exists = fs.existsSync(dbPath)

  if (!exists) {
    return NextResponse.json({
      status: 'missing',
      message: 'Database file not found.',
    })
  }

  try {
    const { prisma } = await import('@/lib/prisma')
    await prisma.$queryRaw`SELECT 1`
    await prisma.user.count()
    return NextResponse.json({
      status: 'ok',
      message: 'Database is initialized.',
    })
  } catch {
    return NextResponse.json({
      status: 'uninitialized',
      message: 'Database exists but tables are missing.',
    })
  }
}

export async function POST() {
  try {
    const output = execSync('npx prisma migrate deploy', {
      cwd: process.cwd(),
      env: process.env,
      encoding: 'utf8',
      timeout: 120000,
    })
    return NextResponse.json({ success: true, output })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { success: false, output: message },
      { status: 500 }
    )
  }
}
