import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  floor: z.number().int().min(1).max(4).default(1),
  room: z.string().optional(),
  organizer: z.string().optional(),
  isActive: z.boolean().default(true),
})

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { startTime: 'desc' },
    })
    return NextResponse.json(events)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch events' },
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
    const data = eventSchema.parse(body)
    const event = await prisma.event.create({ data })
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
