import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const mediaSchema = z.object({
  type: z.enum(['YOUTUBE', 'LOCAL', 'EXTERNAL']),
  url: z.string().min(1),
  title: z.string().optional(),
  displayOrder: z.number().int().default(0),
  duration: z.number().int().default(10),
  isActive: z.boolean().default(true),
  objectFit: z.string().default('contain'),
})

export async function GET() {
  try {
    const media = await prisma.media.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json(media)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const data = mediaSchema.parse(body)
    const media = await prisma.media.create({ data })
    return NextResponse.json(media, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.issues }, { status: 400 })
    return NextResponse.json(
      { error: 'Failed to create media' },
      { status: 500 }
    )
  }
}
