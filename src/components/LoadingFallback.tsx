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
            className="w-32 h-32 rounded-full mx-auto object-cover"
          />
        </div>
        
        {/* Loading Text */}
        <h2 className="text-white text-2xl font-bold mb-8">Entering Kubo</h2>
        
        {/* Old School Progress Bar with Rectangles */}
        <div className="w-full max-w-xs mx-auto mb-4">
          <div className="flex gap-1 h-4">
            {Array.from({ length: 20 }, (_, i) => {
              const segmentProgress = (progress / 100) * 20;
              const isActive = i < segmentProgress;
              return (
                <div
                  key={i}
                  className={`flex-1 transition-all duration-200 ${
                    isActive ? 'bg-white' : 'bg-gray-800'
                  }`}
                  style={{
                    opacity: isActive ? 1 : 0.3
                  }}
                />
              );
            })}
          </div>
        </div>
        
        {/* Percentage */}
        <p className="text-white text-lg font-mono">
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  )
}
