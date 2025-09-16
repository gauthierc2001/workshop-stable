'use client'

import { useEffect, useState, useRef } from 'react'

interface AudioManagerProps {
  ambientSrc: string
  volume?: number
}

export function AudioManager({ ambientSrc, volume = 0.3 }: AudioManagerProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio(ambientSrc)
      audio.loop = true
      audio.volume = volume
      audio.preload = 'auto'
      
      audioRef.current = audio

      // Handle loading events
      const handleCanPlay = () => {
        setIsLoaded(true)
        console.log('🔊 Ambient sound loaded successfully')
        // Try to autoplay when loaded
        if (!isMuted) {
          audio.play().catch((error) => {
            console.log('Autoplay prevented by browser:', error)
            // Autoplay was prevented, user will need to click to enable
          })
        }
      }

      const handleError = (error: any) => {
        console.error('❌ Ambient sound loading failed:', error)
      }

      audio.addEventListener('canplaythrough', handleCanPlay)
      audio.addEventListener('error', handleError)

      return () => {
        audio.removeEventListener('canplaythrough', handleCanPlay)
        audio.removeEventListener('error', handleError)
        audio.pause()
        audio.src = ''
      }
    }
  }, [ambientSrc, volume, isMuted])

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        // Unmute
        audioRef.current.volume = volume
        audioRef.current.play().catch((error) => {
          console.log('Play failed:', error)
        })
        setIsMuted(false)
      } else {
        // Mute
        audioRef.current.pause()
        setIsMuted(true)
      }
    }
  }

  // Handle user interaction to enable audio (for browsers that block autoplay)
  useEffect(() => {
    const enableAudioOnInteraction = () => {
      if (audioRef.current && isLoaded && !isMuted) {
        audioRef.current.play().catch(() => {
          // Still couldn't play, that's ok
        })
      }
      // Remove the listener after first interaction
      document.removeEventListener('click', enableAudioOnInteraction)
      document.removeEventListener('keydown', enableAudioOnInteraction)
    }

    document.addEventListener('click', enableAudioOnInteraction)
    document.addEventListener('keydown', enableAudioOnInteraction)

    return () => {
      document.removeEventListener('click', enableAudioOnInteraction)
      document.removeEventListener('keydown', enableAudioOnInteraction)
    }
  }, [isLoaded, isMuted])

  return (
    <button
      onClick={toggleMute}
      className="fixed top-4 right-4 z-50 bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-3 rounded-lg transition-all duration-200 hover:scale-105"
      title={isMuted ? 'Unmute ambient sound' : 'Mute ambient sound'}
    >
      {!isLoaded ? (
        // Loading icon
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6l4 2"></path>
        </svg>
      ) : isMuted ? (
        // Muted icon
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      ) : (
        // Unmuted icon
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      )}
    </button>
  )
}
