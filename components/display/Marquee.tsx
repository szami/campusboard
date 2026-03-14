'use client'

interface MarqueeProps {
  texts: string[]
  speed?: number
}

export default function Marquee({ texts, speed = 40 }: MarqueeProps) {
  if (texts.length === 0) return null

  const combined = texts.join('   ✦   ')

  return (
    <div className='relative w-full overflow-hidden bg-ocean-950/80 border-t-2 border-crimson-700/60'>
      <div className='flex items-center'>
        {/* Label badge */}
        <div className='shrink-0 bg-crimson-700 text-white text-xs font-bold px-4 py-2 uppercase tracking-widest z-10'>
          📢 INFO
        </div>
        {/* Scrolling text */}
        <div className='flex-1 overflow-hidden py-2'>
          <div
            className='marquee-track whitespace-nowrap text-white text-sm font-medium'
            style={{
              animationDuration: `${Math.max(20, combined.length / 3)}s`,
            }}
          >
            {combined}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{combined}
          </div>
        </div>
      </div>
    </div>
  )
}
