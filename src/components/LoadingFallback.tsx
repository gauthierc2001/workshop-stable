import { useState, useEffect } from 'react'

export function LoadingFallback() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        // Simulate realistic loading progress
        const increment = Math.random() * 15 + 5 // Random between 5-20%
        return Math.min(prev + increment, 100)
      })
    }, 200) // Update every 200ms

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center w-full h-full bg-black">
      <div className="text-center max-w-md mx-auto px-8">
        {/* Kubo Logo */}
        <div className="mb-8">
          <img 
            src="/images/logo.jpg" 
            alt="Kubo Logo" 
            className="w-24 h-24 rounded-full mx-auto object-cover shadow-2xl"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(235, 119, 59, 0.5))'
            }}
          />
        </div>
        
        {/* Loading Text */}
        <h2 className="text-white text-2xl font-bold mb-2">Kubo Loading</h2>
        <p className="text-gray-400 text-sm mb-8">Preparing 3D Workshop Environment</p>
        
        {/* Progress Bar Container */}
        <div className="w-full bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
          </div>
        </div>
        
        {/* Percentage */}
        <p className="text-white text-lg font-mono">
          {Math.round(progress)}%
        </p>
        
        {/* Subtle animation dots */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style={{animationDelay: '0ms'}}></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style={{animationDelay: '200ms'}}></div>
          <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style={{animationDelay: '400ms'}}></div>
        </div>
      </div>
    </div>
  )
}
