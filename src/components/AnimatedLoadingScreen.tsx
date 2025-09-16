'use client'

import { useEffect, useRef, useState, useMemo } from 'react'

interface AnimatedLoadingScreenProps {
  onEnterKova: () => void
}

export function AnimatedLoadingScreen({ onEnterKova }: AnimatedLoadingScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const sceneRef = useRef<any>()
  const cameraRef = useRef<any>()
  const rendererRef = useRef<any>()
  const pointsRef = useRef<any>()
  const timeRef = useRef(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Audio setup for click sound
  const clickAudio = useMemo(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sound/click.mp3')
      audio.preload = 'auto'
      audio.volume = 0.7
      return audio
    }
    return null
  }, [])

  useEffect(() => {
    // Load Three.js dynamically
    const loadThreeJS = async () => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.min.js'
      script.onload = () => {
        initializeThreeJS()
      }
      document.head.appendChild(script)
    }

    const initializeThreeJS = () => {
      if (!canvasRef.current || !(window as any).THREE) return

      const THREE = (window as any).THREE

      // Scene setup
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(
        60, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        2000
      )

      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        canvas: canvasRef.current
      })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(0x000000, 1)

      // Build the initial grid
      const buildGrid = () => {
        // Remove old grid if it exists
        if (pointsRef.current) {
          scene.remove(pointsRef.current)
          pointsRef.current.geometry.dispose()
          pointsRef.current.material.dispose()
        }

        // Grid size scales with screen size - full width coverage
        const gridX = Math.floor(window.innerWidth / 2) // higher density for full width
        const gridZ = Math.floor(window.innerHeight / 4) // more depth for full coverage
        const spacing = 0.4 // smaller spacing for more density

        const geometry = new THREE.BufferGeometry()
        const positions = []
        const colors = []

        for (let x = -gridX / 2; x < gridX / 2; x++) {
          for (let z = -gridZ / 2; z < gridZ / 2; z++) {
            positions.push(x * spacing, 0, z * spacing)
            // Default color (will be updated in animation)
            colors.push(0.96, 0.87, 0.70) // RGB for 0xf5deb3
          }
        }

        geometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(positions, 3)
        )
        geometry.setAttribute(
          'color',
          new THREE.Float32BufferAttribute(colors, 3)
        )

        // Material with warm cream/grey glow
        const material = new THREE.PointsMaterial({
          color: 0xf5deb3, // warm sand/cream
          size: 0.2,
          transparent: true,
          opacity: 0.9,
          vertexColors: true // Enable vertex colors for gradient effect
        })

        const points = new THREE.Points(geometry, material)
        scene.add(points)

        // Camera position based on height
        camera.position.set(0, window.innerHeight / 30, window.innerHeight / 10)

        // Store references
        pointsRef.current = points
        sceneRef.current = scene
        cameraRef.current = camera
        rendererRef.current = renderer
      }

      // Build initial grid
      buildGrid()

      // Start animation
      animate()

      // Set loaded state when Three.js is ready
      setIsLoaded(true)

      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        buildGrid() // rebuild grid to fit new size
      }

      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }

    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !pointsRef.current) return

      timeRef.current += 0.005 // slower for smooth waves

      const positions = pointsRef.current.geometry.attributes.position.array
      const colors = pointsRef.current.geometry.attributes.color.array

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i]
        const z = positions[i + 2]

        // Smooth rolling hills with combined sine & cosine
        const wave =
          Math.sin(x * 0.05 + timeRef.current) * 2.0 +
          Math.cos(z * 0.07 + timeRef.current * 0.8) * 2.0

        positions[i + 1] = wave

         // Static color - no mouse tracking for better performance
         colors[i] = 0.96
         colors[i + 1] = 0.87
         colors[i + 2] = 0.70

        // Distance-based fading
        const dist = Math.sqrt(x * x + z * z)
        const fade = Math.max(0.2, 1.5 - dist / 300)
        pointsRef.current.material.opacity = fade
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true
      pointsRef.current.geometry.attributes.color.needsUpdate = true
      rendererRef.current.render(sceneRef.current, cameraRef.current)
      animationRef.current = requestAnimationFrame(animate)
    }

    loadThreeJS()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Handle Enter Kova button click with sound
  const handleEnterKovaClick = () => {
    // Play click sound
    if (clickAudio) {
      clickAudio.currentTime = 0
      clickAudio.play().catch((error) => {
        console.log('Audio play failed:', error)
      })
    }
    onEnterKova()
  }

  return (
     <div className="relative w-full h-full overflow-hidden">
      {/* Three.js Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />
      
      {/* Loading Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center max-w-md mx-auto px-8">
           {/* Kova Systems Logo */}
           <div className="mb-1">
             <img 
               src="/images/logo.png" 
               alt="Kova Systems Logo" 
               className="w-96 h-96 rounded-full mx-auto object-cover"
             />
           </div>
           
           {/* Enter Button - only show when loaded */}
           {isLoaded && (
             <button
               onClick={handleEnterKovaClick}
               className="bg-white text-black px-8 py-4 rounded-lg text-xl font-bold hover:bg-gray-200 transition-all duration-300 hover:scale-105 shadow-lg"
             >
               Enter Kova
             </button>
           )}
        </div>
      </div>
    </div>
  )
}
