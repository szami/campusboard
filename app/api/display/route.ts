import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/display - single endpoint that returns everything for the display screen
export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    )

    const [events, announcements, media, settings] = await Promise.all([
      prisma.event.findMany({
        where: {
          isActive: true,
          startTime: { gte: startOfDay, lte: endOfDay },
        },
        orderBy: { startTime: 'asc' },
      }),
      prisma.announcement.findMany({
        where: { isActive: true },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.media.findMany({
        where: { isActive: true },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.setting.findMany(),
    ])

    const settingsMap: Record<string, string> = {}
    settings.forEach((s) => {
      settingsMap[s.key] = s.value
    })

    return NextResponse.json({
      events,
      announcements,
      media,
      settings: settingsMap,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch display data' },
      { status: 500 }
    )
  }
}
