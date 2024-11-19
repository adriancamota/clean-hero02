'use client'
import { createContext, useContext, useState, useEffect } from 'react'

type AudioContextType = {
  isPlaying: boolean
  toggleAudio: () => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // Create audio element
    const audioElement = new Audio('/background-music.mp3') // Add your music file to the public folder
    audioElement.loop = true
    setAudio(audioElement)

    // Load saved preference
    const shouldPlay = localStorage.getItem('backgroundMusic') === 'true'
    setIsPlaying(shouldPlay)
    if (shouldPlay) {
      audioElement.play().catch(console.error)
    }

    return () => {
      audioElement.pause()
      audioElement.src = ''
    }
  }, [])

  const toggleAudio = () => {
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(console.error)
    }
    setIsPlaying(!isPlaying)
    localStorage.setItem('backgroundMusic', String(!isPlaying))
  }

  return (
    <AudioContext.Provider value={{ isPlaying, toggleAudio }}>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
} 