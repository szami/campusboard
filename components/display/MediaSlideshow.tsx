'use client'
import { getYouTubeVideoId } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

interface MediaItem {
  id: string
  type: string
  url: string
  title?: string | null
  duration: number
  displayOrder: number
  objectFit?: string | null
}

interface MediaSlideshowProps {
  items: MediaItem[]
  defaultVideoUrl?: string
  bgMusicUrl?: string
}

// ─── YouTube embed ─────────────────────────────────────────────────────────
function YouTubeEmbed({
  videoId,
  isMuted,
}: {
  videoId: string
  isMuted: boolean
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const cmd = isMuted
      ? '{"event":"command","func":"mute","args":""}'
      : '{"event":"command","func":"unMute","args":""}'
    iframe.contentWindow?.postMessage(cmd, '*')
  }, [isMuted])

  return (
    <iframe
      ref={iframeRef}
      className='w-full h-full'
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&showinfo=0&enablejsapi=1`}
      allow='autoplay; encrypted-media'
      allowFullScreen
    />
  )
}

// ─── Main component ────────────────────────────────────────────────────────
export default function MediaSlideshow({
  items,
  defaultVideoUrl,
  bgMusicUrl,
}: MediaSlideshowProps) {
  // Split into image vs video groups
  const imageItems = items.filter((i) => {
    if (i.type !== 'LOCAL' && i.type !== 'EXTERNAL') return false
    return !i.url.match(/\.(mp4|webm|ogg)$/i)
  })

  const videoItems: MediaItem[] = [
    ...items.filter((i) => i.type === 'YOUTUBE'),
    ...items.filter(
      (i) =>
        (i.type === 'LOCAL' || i.type === 'EXTERNAL') &&
        !!i.url.match(/\.(mp4|webm|ogg)$/i)
    ),
  ]

  const allVideoItems: MediaItem[] =
    videoItems.length > 0
      ? videoItems
      : defaultVideoUrl
        ? [
            {
              id: 'default',
              type: 'YOUTUBE',
              url: defaultVideoUrl,
              title: 'Video Profil Kampus',
              duration: 0,
              displayOrder: 0,
            },
          ]
        : []

  const hasImages = imageItems.length > 0
  const hasVideos = allVideoItems.length > 0

  const [mode, setMode] = useState<'image' | 'video'>(
    hasVideos ? 'video' : 'image'
  )
  const [imageIndex, setImageIndex] = useState(0)
  const [videoIndex, setVideoIndex] = useState(0)
  const [ytMuted, setYtMuted] = useState(true)
  const [musicPlaying, setMusicPlaying] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const slideTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const unmuteTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  // Background music: play only in image mode
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !bgMusicUrl) return
    if (mode === 'image') {
      audio.play().catch(() => {})
      setMusicPlaying(true)
    } else {
      audio.pause()
      setMusicPlaying(false)
    }
  }, [mode, bgMusicUrl])

  // Image slideshow auto-advance
  useEffect(() => {
    if (mode !== 'image' || imageItems.length <= 1) return
    const current = imageItems[imageIndex]
    const duration = (current?.duration ?? 10) * 1000
    slideTimerRef.current = setTimeout(() => {
      setImageIndex((prev) => (prev + 1) % imageItems.length)
    }, duration)
    return () => clearTimeout(slideTimerRef.current)
  }, [mode, imageIndex, imageItems.length])

  // Video mode: reset muted on each video change, auto-unmute after 2.5s
  useEffect(() => {
    if (mode !== 'video') return
    clearTimeout(unmuteTimerRef.current)
    setYtMuted(true)
    unmuteTimerRef.current = setTimeout(() => {
      setYtMuted(false)
    }, 2500)
    return () => clearTimeout(unmuteTimerRef.current)
  }, [mode, videoIndex])

  const switchMode = (next: 'image' | 'video') => {
    clearTimeout(slideTimerRef.current)
    clearTimeout(unmuteTimerRef.current)
    setMode(next)
  }

  if (!hasImages && !hasVideos) {
    return (
      <div className='w-full h-full flex items-center justify-center bg-ocean-900/50 rounded-2xl'>
        <div className='text-center text-ocean-400'>
          <div className='text-6xl mb-3'>🎬</div>
          <div className='text-sm'>Tidak ada media tersedia</div>
        </div>
      </div>
    )
  }

  const renderImage = () => {
    if (!hasImages)
      return (
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className='text-white/40 text-sm'>Tidak ada gambar</span>
        </div>
      )
    const item = imageItems[imageIndex]
    return (
      <img
        key={item.id}
        src={item.url}
        alt={item.title ?? 'Media'}
        className={`absolute inset-0 w-full h-full ${
          item.objectFit === 'cover' ? 'object-cover' : 'object-contain'
        }`}
        style={{ background: '#000' }}
      />
    )
  }

  const renderVideo = () => {
    if (!hasVideos)
      return (
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className='text-white/40 text-sm'>Tidak ada video</span>
        </div>
      )
    const item = allVideoItems[videoIndex]
    if (item.type === 'YOUTUBE') {
      const videoId = getYouTubeVideoId(item.url)
      if (!videoId)
        return (
          <div className='absolute inset-0 flex items-center justify-center text-white/60 text-sm'>
            URL YouTube tidak valid
          </div>
        )
      return <YouTubeEmbed videoId={videoId} isMuted={ytMuted} />
    }
    return (
      <video
        key={item.id}
        src={item.url}
        autoPlay
        muted={ytMuted}
        className='w-full h-full object-cover'
        onEnded={() =>
          setVideoIndex((prev) => (prev + 1) % allVideoItems.length)
        }
      />
    )
  }

  const currentTitle =
    mode === 'image'
      ? hasImages
        ? imageItems[imageIndex]?.title
        : null
      : hasVideos
        ? allVideoItems[videoIndex]?.title
        : null

  return (
    <div className='relative w-full h-full rounded-2xl overflow-hidden bg-ocean-950'>
      {/* Hidden background audio — plays only in image mode */}
      {bgMusicUrl && (
        <audio ref={audioRef} src={bgMusicUrl} loop preload='auto' />
      )}

      {/* Media content */}
      {mode === 'image' ? renderImage() : renderVideo()}

      {/* Title overlay */}
      {currentTitle && (
        <div className='absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-4 pointer-events-none'>
          <p className='text-white text-sm font-medium'>{currentTitle}</p>
        </div>
      )}

      {/* Mode badge (top-left) */}
      <div className='absolute top-3 left-3 z-10 pointer-events-none'>
        <span
          className='px-2 py-1 rounded-lg text-xs font-semibold'
          style={{
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            color: mode === 'image' ? '#90e0ef' : '#fbbf24',
          }}
        >
          {mode === 'image' ? '🖼️ Mode Gambar' : '🎬 Mode Video'}
        </span>
      </div>

      {/* Controls (top-right) */}
      <div className='absolute top-3 right-3 z-10 flex gap-2'>
        {/* Mode toggle — only when both groups exist */}
        {hasImages && hasVideos && (
          <button
            onClick={() => switchMode(mode === 'image' ? 'video' : 'image')}
            title={
              mode === 'image'
                ? 'Beralih ke Mode Video'
                : 'Beralih ke Mode Gambar'
            }
            className='flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110 active:scale-95'
            style={{
              background:
                mode === 'image'
                  ? 'rgba(251,191,36,0.8)'
                  : 'rgba(0,119,182,0.8)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            <span className='text-lg leading-none'>
              {mode === 'image' ? '🎬' : '🖼️'}
            </span>
          </button>
        )}

        {/* Sound toggle — video mode only */}
        {mode === 'video' && (
          <button
            onClick={() => {
              clearTimeout(unmuteTimerRef.current)
              setYtMuted((m) => !m)
            }}
            title={ytMuted ? 'Aktifkan Suara' : 'Matikan Suara'}
            className='flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110 active:scale-95'
            style={{
              background: ytMuted ? 'rgba(0,0,0,0.55)' : 'rgba(0,119,182,0.85)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            <span className='text-lg leading-none'>
              {ytMuted ? '🔇' : '🔊'}
            </span>
          </button>
        )}

        {/* Music toggle — image mode + bgMusicUrl only */}
        {mode === 'image' && bgMusicUrl && (
          <button
            onClick={() => {
              const audio = audioRef.current
              if (!audio) return
              if (audio.paused) {
                audio.play().catch(() => {})
                setMusicPlaying(true)
              } else {
                audio.pause()
                setMusicPlaying(false)
              }
            }}
            title={musicPlaying ? 'Matikan Musik' : 'Putar Musik'}
            className='flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110 active:scale-95'
            style={{
              background: musicPlaying
                ? 'rgba(0,119,182,0.85)'
                : 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            <span className='text-lg leading-none'>🎵</span>
          </button>
        )}
      </div>

      {/* Image navigation dots */}
      {mode === 'image' && imageItems.length > 1 && (
        <div className='absolute bottom-3 right-3 z-10 flex gap-1.5'>
          {imageItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                clearTimeout(slideTimerRef.current)
                setImageIndex(idx)
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === imageIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Video navigation dots */}
      {mode === 'video' && allVideoItems.length > 1 && (
        <div className='absolute bottom-3 right-3 z-10 flex gap-1.5'>
          {allVideoItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                clearTimeout(unmuteTimerRef.current)
                setVideoIndex(idx)
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === videoIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
