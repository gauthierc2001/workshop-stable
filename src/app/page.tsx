'use client'

import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Text } from '@react-three/drei'
import { Suspense, useEffect, useState, useRef, useMemo } from 'react'
import { Room, triggerCameraZoomBack } from '@/components/Room'
import { LoadingFallback } from '@/components/LoadingFallback'
import { AnimatedLoadingScreen } from '@/components/AnimatedLoadingScreen'
import { AudioManager } from '@/components/AudioManager'
import { Vector3 } from 'three'
import * as THREE from 'three'

function TerminalAnimation() {
  const [displayText, setDisplayText] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  
  const terminalLines = [
    'PS C:\\Users\\User> kova --version',
    'Kova Systems v1.0.0',
    '',
    'PS C:\\Users\\User> kova init',
    'Initializing Kova Systems...',
    'Loading configuration...',
    'Connecting to Solana network...',
    'Initializing PoSC protocol...',
    'Setting up data validation...',
    'Configuring robot interfaces...',
    'Establishing secure channels...',
    '',
    'Kova Systems initialized successfully!',
    '',
    'Available commands:',
    '  kova status     - Check system status',
    '  kova connect    - Connect robot to network',
    '  kova contribute - Start data contribution',
    '  kova dashboard  - Open web dashboard',
    '',
    'Coming soon...',
    '',
    'PS C:\\Users\\User>'
  ]
  
  useEffect(() => {
    console.log('Terminal animation starting...')
    setIsAnimating(true)
    setDisplayText('')
    
    let currentLine = 0
    const interval = setInterval(() => {
      if (currentLine < terminalLines.length) {
        const line = terminalLines[currentLine]
        setDisplayText(prev => {
          if (line === '') {
            return prev + '\n'
          } else {
            return prev + (prev ? '\n' : '') + line
          }
        })
        currentLine++
      } else {
        clearInterval(interval)
        setIsAnimating(false)
      }
    }, 200)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="whitespace-pre-wrap" style={{ minHeight: '200px' }}>
      {displayText.split('\n').map((line, index) => {
        if (line.startsWith('PS C:\\Users\\User>')) {
          return (
            <div key={index} style={{ color: '#8B4513', fontWeight: 'bold' }}>
              {line}
            </div>
          )
        } else if (line.includes('successfully')) {
          return (
            <div key={index} style={{ color: '#228B22', fontWeight: 'bold' }}>
              {line}
            </div>
          )
        } else if (line.includes('Loading') || line.includes('Connecting') || line.includes('Initializing') || line.includes('Setting') || line.includes('Configuring') || line.includes('Establishing')) {
          return (
            <div key={index} style={{ color: '#D2691E', fontWeight: 'bold' }}>
              {line}
            </div>
          )
        } else if (line.includes('Coming soon')) {
          return (
            <div key={index} style={{ color: '#B22222', fontWeight: 'bold' }}>
              {line}
            </div>
          )
        }
        return (
          <div key={index} style={{ color: '#2F2F2F' }}>
            {line}
          </div>
        )
      })}
      {isAnimating && <span className="animate-pulse" style={{ color: '#000000', fontWeight: 'bold' }}>█</span>}
    </div>
  )
}

function FixedCameraController({ onPositionChange, isZoomed }: { 
  onPositionChange: (pos: Vector3, target: Vector3) => void, 
  isZoomed: boolean
}) {
  const { camera } = useThree()

  useEffect(() => {
    if (isZoomed) {
      // When zoomed, set to zoom coordinates
      camera.position.set(-458.672, 446.169, 912.762)
      camera.lookAt(-458.732, 446.169, 913.022)
    } else {
      // Default fixed position
      camera.position.set(-160.56, 686.20, 98.60)
      camera.lookAt(-634.75, 669.00, 820.31)
    }
    
    // Update position tracking
    if (onPositionChange) {
      const target = new Vector3(-634.75, 669.00, 820.31)
      if (isZoomed) {
        target.set(-458.732, 446.169, 913.022)
      }
      onPositionChange(camera.position.clone(), target)
    }
  }, [camera, isZoomed, onPositionChange])

  return (
    <>
      {/* Simple center point indicator */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="#f5deb3" />
      </mesh>
    </>
  )
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [baseCameraPosition, setBaseCameraPosition] = useState(new Vector3(-160.56, 686.20, 98.60))
  const [baseCameraTarget, setBaseCameraTarget] = useState(new Vector3(-634.75, 669.00, 820.31))
  const [cameraPosition, setCameraPosition] = useState(new Vector3(-160.56, 686.20, 98.60))
  const [cameraTarget, setCameraTarget] = useState(new Vector3(-634.75, 669.00, 820.31))
  const [isZoomed, setIsZoomed] = useState(false)
  const [showScreenUI, setShowScreenUI] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [showDocs, setShowDocs] = useState(false)
  const [showTerminal, setShowTerminal] = useState(false)
  
  // Handle entering the main application
  const handleEnterKova = () => {
    setIsLoading(false)
  }


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

  const handlePositionChange = (pos: Vector3, target: Vector3) => {
    setCameraPosition(pos)
    setCameraTarget(target)
  }

  const handleZoomStateChange = (zoomed: boolean) => {
    setIsZoomed(zoomed)
    if (!zoomed) {
      setShowScreenUI(false) // Hide UI when zoom out
    }
  }

  const handleScreenZoomComplete = () => {
    setShowScreenUI(true) // Show UI when zoom to screen is complete
  }

  const handleBackToOverview = () => {
    // Play click sound
    if (clickAudio) {
      clickAudio.currentTime = 0
      clickAudio.play().catch((error) => {
        console.log('Audio play failed:', error)
      })
    }
    triggerCameraZoomBack() // This will trigger the zoom back and update isZoomed via onZoomStateChange
  }

  const handleIconClick = (iconName: string) => {
    console.log(`🖱️ Clicked on ${iconName} icon`)
    
    // Play click sound
    if (clickAudio) {
      clickAudio.currentTime = 0 // Reset to start for rapid clicks
      clickAudio.play().catch((error) => {
        console.log('Audio play failed:', error)
      })
    }
    
    // You can add specific actions for each icon here
    switch (iconName) {
      case 'X':
        window.open('https://x.com/KovaSystems', '_blank')
        break
      case 'GitHub':
        window.open('https://github.com/KovaSystems', '_blank')
        break
      case 'Docs':
        setShowDocs(true)
        break
      case 'App':
        setShowTerminal(true)
        break
      case 'Medium':
        window.open('https://medium.com/@KovaSystems/', '_blank')
        break
      case 'LiveStream':
        window.open('https://pump.fun/live', '_blank')
        break
    }
  }

  // Show animated loading screen first
  if (isLoading) {
    return <AnimatedLoadingScreen onEnterKova={handleEnterKova} />
  }

  return (
    <main className="w-full h-screen overflow-hidden relative">
      {/* Ambient Audio Manager with Mute Button */}
      <AudioManager ambientSrc="/sound/ambiant.mp3" volume={1.0} />
      
      {/* Screen UI Overlay - appears when zoomed to screen */}
      {isZoomed && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Back button in top-left */}
          <button
            onClick={handleBackToOverview}
            className="absolute top-6 left-6 bg-black bg-opacity-80 hover:bg-opacity-100 text-white p-3 rounded-lg transition-all duration-200 hover:scale-105 pointer-events-auto"
            title="Retour à la vue d'ensemble"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          
          {/* Desktop icons positioned relative to screen center */}
          <div className="absolute pointer-events-auto" style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}>
            {/* Icons positioned relative to screen center with viewport units for true responsiveness */}
            <div className="relative">
              {/* Top Row - 3 Icons */}
              
              {/* X Icon - top left */}
              <button 
                onClick={() => handleIconClick('X')}
                className="absolute flex flex-col items-center justify-center hover:scale-110 transition-all duration-200"
                style={{
                  top: '-8vh',
                  left: '-12vw'
                }}
              >
                <div className="rounded flex items-center justify-center text-black" style={{
                  width: 'clamp(48px, 7vw, 58px)',
                  height: 'clamp(48px, 7vw, 58px)',
                  backgroundColor: '#f5deb3',
                  marginBottom: '6px',
                  border: '2px solid #000000'
                }}>
                  <svg style={{ width: 'clamp(24px, 4.8vw, 28px)', height: 'clamp(24px, 4.8vw, 28px)' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="text-black font-medium" style={{ fontSize: 'clamp(24px, 3.5vw, 28px)' }}>X</span>
              </button>
              
              {/* Docs Icon - top center */}
              <button 
                onClick={() => handleIconClick('Docs')}
                className="absolute flex flex-col items-center justify-center hover:scale-110 transition-all duration-200"
                style={{
                  top: '-8vh',
                  left: '-2vw'
                }}
              >
                <div className="rounded flex items-center justify-center text-black" style={{
                  width: 'clamp(52px, 7.9vw, 63px)',
                  height: 'clamp(52px, 7.9vw, 63px)',
                  backgroundColor: '#f5deb3',
                  marginBottom: '6px',
                  border: '2px solid #000000'
                }}>
                  <svg style={{ width: 'clamp(26px, 5.3vw, 32px)', height: 'clamp(26px, 5.3vw, 32px)' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <span className="text-black font-medium" style={{ fontSize: 'clamp(26px, 4vw, 32px)' }}>Docs</span>
              </button>
              
              {/* Kova Systems Icon - top right */}
              <button 
                onClick={() => handleIconClick('App')}
                className="absolute flex flex-col items-center justify-center hover:scale-110 transition-all duration-200"
                style={{
                  top: '-8vh',
                  left: '8vw'
                }}
              >
                <div className="rounded flex items-center justify-center overflow-hidden" style={{
                  width: 'clamp(52px, 7.9vw, 63px)',
                  height: 'clamp(52px, 7.9vw, 63px)',
                  backgroundColor: '#f5deb3',
                  marginBottom: '6px',
                  border: '2px solid #000000'
                }}>
                  <img 
                    src="/images/logo.png" 
                    alt="Kova Systems Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-black font-medium" style={{ fontSize: 'clamp(26px, 4vw, 32px)' }}>Kova</span>
              </button>
              
              {/* Bottom Row - 2 Icons */}
              
              {/* GitHub Icon - bottom left */}
              <button 
                onClick={() => handleIconClick('GitHub')}
                className="absolute flex flex-col items-center justify-center hover:scale-110 transition-all duration-200"
                style={{
                  top: '6vh',
                  left: '-12vw'
                }}
              >
                <div className="rounded flex items-center justify-center text-black" style={{
                  width: 'clamp(52px, 7.9vw, 63px)',
                  height: 'clamp(52px, 7.9vw, 63px)',
                  backgroundColor: '#f5deb3',
                  marginBottom: '6px',
                  border: '2px solid #000000'
                }}>
                  <svg style={{ width: 'clamp(26px, 5.3vw, 32px)', height: 'clamp(26px, 5.3vw, 32px)' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <span className="text-black font-medium" style={{ fontSize: 'clamp(26px, 4vw, 32px)' }}>GitHub</span>
              </button>
              
              {/* Medium Icon - bottom center */}
              <button 
                onClick={() => handleIconClick('Medium')}
                className="absolute flex flex-col items-center justify-center hover:scale-110 transition-all duration-200"
                style={{
                  top: '6vh',
                  left: '-2vw'
                }}
              >
                <div className="rounded flex items-center justify-center text-black" style={{
                  width: 'clamp(52px, 7.9vw, 63px)',
                  height: 'clamp(52px, 7.9vw, 63px)',
                  backgroundColor: '#f5deb3',
                  marginBottom: '6px',
                  border: '2px solid #000000'
                }}>
                  <svg style={{ width: 'clamp(26px, 5.3vw, 32px)', height: 'clamp(26px, 5.3vw, 32px)' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75S24 8.83 24 12z"/>
                  </svg>
                </div>
                <span className="text-black font-medium" style={{ fontSize: 'clamp(26px, 4vw, 32px)' }}>Medium</span>
              </button>
              
              {/* LiveStream Icon - bottom right */}
              <button 
                onClick={() => handleIconClick('LiveStream')}
                className="absolute flex flex-col items-center justify-center hover:scale-110 transition-all duration-200"
                style={{
                  top: '6vh',
                  left: '8vw'
                }}
              >
                <div className="rounded flex items-center justify-center overflow-hidden" style={{
                  width: 'clamp(52px, 7.9vw, 63px)',
                  height: 'clamp(52px, 7.9vw, 63px)',
                  backgroundColor: '#f5deb3',
                  marginBottom: '6px',
                  border: '2px solid #000000'
                }}>
                  <img 
                    src="/images/stream.png" 
                    alt="LiveStream Icon" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-black font-medium" style={{ fontSize: 'clamp(26px, 4vw, 32px)' }}>Live</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Coming Soon Window */}
      {showComingSoon && (
        <div className="absolute pointer-events-auto" style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 30
        }}>
          <div className="bg-white rounded-lg shadow-2xl border-4 border-gray-800 relative" style={{
            padding: 'clamp(8px, 1.5vw, 16px)',
            width: 'clamp(260px, 32.5vw, 364px)',
            maxHeight: 'clamp(260px, 39vh, 390px)'
          }}>
            {/* Close button */}
            <button
              onClick={() => {
                // Play click sound
                if (clickAudio) {
                  clickAudio.currentTime = 0
                  clickAudio.play().catch((error) => {
                    console.log('Audio play failed:', error)
                  })
                }
                setShowComingSoon(false)
              }}
              className="absolute text-gray-500 hover:text-gray-700 font-bold"
              style={{
                top: 'clamp(8px, 1vw, 12px)',
                right: 'clamp(8px, 1vw, 12px)',
                fontSize: 'clamp(16px, 2.5vw, 24px)'
              }}
            >
              ×
            </button>
            
            {/* Window content */}
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center" style={{
                width: 'clamp(32px, 5vw, 48px)',
                height: 'clamp(32px, 5vw, 48px)',
                marginBottom: 'clamp(8px, 1.2vw, 12px)'
              }}>
                <img 
                  src="/images/logo.png" 
                  alt="Kubo Logo" 
                  className="rounded-full object-cover"
                  style={{
                    width: 'clamp(32px, 5vw, 48px)',
                    height: 'clamp(32px, 5vw, 48px)'
                  }}
                />
              </div>
              <h2 className="font-bold text-gray-800" style={{
                fontSize: 'clamp(14px, 2.5vw, 20px)',
                marginBottom: 'clamp(4px, 0.8vw, 8px)'
              }}>Kova Systems</h2>
              <p className="text-gray-600" style={{
                fontSize: 'clamp(12px, 2vw, 16px)'
              }}>Coming Soon</p>
              <p className="text-gray-500" style={{
                fontSize: 'clamp(10px, 1.5vw, 12px)',
                marginTop: 'clamp(4px, 0.8vw, 8px)'
              }}>Stay tuned for updates!</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Documentation Window */}
      {showDocs && (
        <div className="absolute pointer-events-auto" style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 30
        }}>
          <div className="rounded-lg shadow-2xl border-4 border-gray-800 relative overflow-hidden" style={{
            padding: 'clamp(8px, 1.2vw, 12px)',
            width: 'clamp(308px, 38.5vw, 440px)',
            height: 'clamp(275px, 38.5vh, 385px)',
            backgroundColor: '#f5deb3'
          }}>
            {/* Close button */}
            <button
              onClick={() => {
                // Play click sound
                if (clickAudio) {
                  clickAudio.currentTime = 0
                  clickAudio.play().catch((error) => {
                    console.log('Audio play failed:', error)
                  })
                }
                setShowDocs(false)
              }}
              className="absolute text-gray-500 hover:text-gray-700 font-bold z-10"
              style={{
                top: 'clamp(8px, 1vw, 12px)',
                right: 'clamp(8px, 1vw, 12px)',
                fontSize: 'clamp(16px, 2.5vw, 24px)'
              }}
            >
              ×
            </button>
            
            {/* Window content */}
            <div className="h-full overflow-y-auto" style={{
              paddingRight: 'clamp(4px, 1vw, 8px)'
            }}>
              <div className="text-center" style={{
                marginBottom: 'clamp(8px, 1.2vw, 10px)'
              }}>
                <div className="mx-auto flex items-center justify-center" style={{
                  width: 'clamp(24px, 3vw, 32px)',
                  height: 'clamp(24px, 3vw, 32px)',
                  marginBottom: 'clamp(4px, 0.6vw, 6px)'
                }}>
                  <img 
                    src="/images/logo.png" 
                    alt="Kova Systems Logo" 
                    className="rounded-full object-cover"
                    style={{
                      width: 'clamp(24px, 3vw, 32px)',
                      height: 'clamp(24px, 3vw, 32px)'
                    }}
                  />
                </div>
                <h1 className="font-bold" style={{
                  fontSize: 'clamp(12px, 1.8vw, 16px)',
                  marginBottom: 'clamp(2px, 0.3vw, 3px)',
                  color: '#000000'
                }}>Kova Systems</h1>
                <p style={{
                  fontSize: 'clamp(8px, 1.2vw, 10px)',
                  color: '#000000'
                }}>Whitepaper v1.0</p>
              </div>
              
              <div className="max-w-none prose-responsive" style={{
                fontSize: 'clamp(8px, 1.1vw, 10px)',
                lineHeight: 'clamp(1.2, 1.3, 1.4)',
                color: '#000000'
              }}>
                <h2 style={{color: '#000000', fontWeight: 'bold', marginTop: 'clamp(8px, 1.2vw, 10px)', marginBottom: 'clamp(6px, 1vw, 8px)'}}>Abstract</h2>
                
                <p style={{marginBottom: 'clamp(8px, 1.2vw, 10px)'}}>Kova Systems introduces Proof of Sensory Contribution (PoSC), a decentralized protocol for collecting and distributing sensory data from robots and smart devices. Robots connected to the Kova network can contribute perception data such as images, LiDAR scans, depth maps, and GPS traces. Each contribution is logged immutably, time-stamped, and geotagged.</p>
                
                <p style={{marginBottom: 'clamp(10px, 1.5vw, 12px)'}}>The core idea is simple and powerful: anyone who owns a robot can connect it to the Kova network and earn by sharing sensory data. Consumers including AI researchers, robotics developers, and companies can request datasets through a structured access layer.</p>

                <h2 style={{color: '#000000', fontWeight: 'bold', marginTop: 'clamp(12px, 1.8vw, 16px)', marginBottom: 'clamp(6px, 1vw, 8px)'}}>1. Introduction</h2>
                
                <p style={{marginBottom: 'clamp(8px, 1.2vw, 10px)'}}>AI and robotics are advancing rapidly, but progress is constrained by the availability of large-scale, diverse sensory datasets. Current datasets are expensive, tightly controlled, and limited in scope. Robots already deployed in agriculture, logistics, manufacturing, and cities generate continuous streams of sensory data, but most of it is discarded or trapped inside proprietary silos.</p>
                
                <p style={{marginBottom: 'clamp(10px, 1.5vw, 12px)'}}>Kova Systems unlocks this latent value. By installing a lightweight client, any robot can connect to the Kova network. Data contributions are logged on Solana for integrity, stored on distributed storage for persistence, and made discoverable for research and development.</p>

                <h2 style={{color: '#000000', fontWeight: 'bold', marginTop: 'clamp(12px, 1.8vw, 16px)', marginBottom: 'clamp(6px, 1vw, 8px)'}}>2. Problem Statement</h2>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>Accessibility:</span> High-quality datasets are costly and often inaccessible to small labs, startups, and independent researchers.</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>Bias:</span> Existing datasets disproportionately represent Western geographies and favorable conditions, leaving gaps in global coverage.</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>Trust:</span> Without clear provenance, sensory data can be manipulated or unreliable.</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>Scalability:</span> Collecting and indexing data at global scale exceeds the capacity of centralized organizations.</p>
                
                <p style={{marginBottom: 'clamp(10px, 1.5vw, 12px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>Idle capacity:</span> Millions of robots already deployed produce untapped data streams with no system to aggregate or monetize them.</p>

                <h2 style={{color: '#000000', fontWeight: 'bold', marginTop: 'clamp(12px, 1.8vw, 16px)', marginBottom: 'clamp(6px, 1vw, 8px)'}}>3. Proof of Sensory Contribution (PoSC)</h2>
                
                <p style={{marginBottom: 'clamp(8px, 1.2vw, 10px)'}}>PoSC defines a method for recording sensory contributions from robots. Each contribution includes:</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)', paddingLeft: 'clamp(8px, 1.2vw, 12px)'}}>• A data file (image, LiDAR scan, IMU trace, etc.)</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)', paddingLeft: 'clamp(8px, 1.2vw, 12px)'}}>• Metadata (time, location, sensor type)</p>
                
                <p style={{marginBottom: 'clamp(10px, 1.5vw, 12px)', paddingLeft: 'clamp(8px, 1.2vw, 12px)'}}>• A cryptographic hash securing integrity</p>

                <h2 style={{color: '#000000', fontWeight: 'bold', marginTop: 'clamp(12px, 1.8vw, 16px)', marginBottom: 'clamp(6px, 1vw, 8px)'}}>4. Use Cases</h2>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>Everyday Robot Owners:</span> Hobbyists, farmers, or small businesses can connect their robots to Kova with minimal setup.</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>Fleet Operators:</span> Companies running delivery robots, drones, or autonomous vehicles can plug fleets into Kova.</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>Agriculture:</span> Farmers using drones or autonomous tractors can contribute crop and soil imagery.</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>Infrastructure:</span> Inspection robots monitoring bridges, pipelines, or power lines can stream their data into Kova.</p>
                
                <p style={{marginBottom: 'clamp(10px, 1.5vw, 12px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>Urban Robotics:</span> Service robots, cleaning robots, and security drones in cities generate rich datasets of environmental conditions.</p>

                <h2 style={{color: '#000000', fontWeight: 'bold', marginTop: 'clamp(12px, 1.8vw, 16px)', marginBottom: 'clamp(6px, 1vw, 8px)'}}>5. System Architecture</h2>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>On-Chain:</span> Contribution Registry stores metadata and file hashes immutably. Dataset Requests enable structured queries.</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>Off-Chain:</span> IPFS for distribution and Arweave for permanence. Validation services for quality control.</p>
                
                <p style={{marginBottom: 'clamp(10px, 1.5vw, 12px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>Robotics Integration:</span> Kova supports ROS2, the standard middleware for modern robotics. Through a PoSC client node, robots can publish data directly to the network.</p>

                <h2 style={{color: '#000000', fontWeight: 'bold', marginTop: 'clamp(12px, 1.8vw, 16px)', marginBottom: 'clamp(6px, 1vw, 8px)'}}>6. Roadmap</h2>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>Phase 1:</span> Contribution registry, uploader client, and basic dashboard</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>Phase 2:</span> Dataset request system and developer APIs</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>Phase 3:</span> Validation services for quality control</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>Phase 4:</span> Multi-sensor support including LiDAR and thermal</p>
                
                <p style={{marginBottom: 'clamp(10px, 1.5vw, 12px)'}}><span style={{color: '#333333', fontWeight: 'bold'}}>Phase 5:</span> Large-scale adoption via partnerships with robotics fleets</p>

                <h2 style={{color: '#333333', fontWeight: 'bold', marginTop: 'clamp(12px, 1.8vw, 16px)', marginBottom: 'clamp(6px, 1vw, 8px)'}}>7. Conclusion</h2>
                
                <p style={{marginBottom: 'clamp(8px, 1.2vw, 10px)'}}>Kova Systems introduces Proof of Sensory Contribution, a protocol that transforms robots into participants in a decentralized data economy. By making every robot — from personal drones to industrial fleets — capable of connecting to the network and earning, Kova unlocks unprecedented global scale.</p>
                
                <p style={{marginBottom: 'clamp(8px, 1.2vw, 10px)'}}>The result is a decentralized perception layer: a living dataset that accelerates AI research, strengthens robotics development, and rewards the individuals and companies who contribute.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Terminal Window */}
      {showTerminal && (
        <div className="absolute pointer-events-auto" style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 30
        }}>
          <div className="rounded-lg shadow-2xl border-4 border-gray-800 relative overflow-hidden" style={{
            padding: 'clamp(8px, 1.2vw, 12px)',
            width: 'clamp(320px, 40vw, 500px)',
            height: 'clamp(280px, 40vh, 400px)',
            backgroundColor: '#f5deb3'
          }}>
            {/* Terminal Header */}
            <div className="flex items-center justify-between mb-2" style={{
              paddingBottom: 'clamp(4px, 0.8vw, 8px)',
              borderBottom: '1px solid #000000'
            }}>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#ff5f56'}}></div>
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#ffbd2e'}}></div>
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#27ca3f'}}></div>
                </div>
                <span className="text-black font-mono" style={{fontSize: 'clamp(10px, 1.5vw, 12px)'}}>Terminal</span>
              </div>
              <button
                onClick={() => {
                  // Play click sound
                  if (clickAudio) {
                    clickAudio.currentTime = 0
                    clickAudio.play().catch((error) => {
                      console.log('Audio play failed:', error)
                    })
                  }
                  setShowTerminal(false)
                }}
                className="text-black hover:text-gray-600 font-bold"
                style={{
                  fontSize: 'clamp(14px, 2vw, 18px)'
                }}
              >
                ×
              </button>
            </div>
            
            {/* Terminal Content */}
            <div className="h-full overflow-y-auto font-mono" style={{
              fontSize: 'clamp(10px, 1.3vw, 12px)',
              lineHeight: '1.4',
              color: '#000000',
              backgroundColor: '#f5deb3',
              padding: '8px'
            }}>
              <TerminalAnimation />
            </div>
          </div>
        </div>
      )}
      
      
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          className="w-full h-full"
          camera={{
            fov: 75,
            near: 0.1,
            far: 10000,
            position: [-160.56, 686.20, 98.60]
          }}
          shadows
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
          gl={{ preserveDrawingBuffer: true }}
          style={{ background: '#000000' }}
        >
          {/* Warm sand ambient lighting - further reduced intensity */}
          <ambientLight intensity={0.02} color="#f5deb3" />
          
          {/* Warm sand hemisphere light - further reduced intensity */}
          <hemisphereLight 
            args={["#f5deb3", "#000000", 0.03]}
          />
          
          {/* Main overhead light - warm sand tone - further reduced */}
          <directionalLight 
            position={[8, 12, 6]} 
            intensity={0.15}
            color="#f5deb3"
            castShadow
            shadow-mapSize-width={4096}
            shadow-mapSize-height={4096}
            shadow-camera-near={0.5}
            shadow-camera-far={100}
            shadow-camera-left={-15}
            shadow-camera-right={15}
            shadow-camera-top={15}
            shadow-camera-bottom={-15}
            shadow-bias={-0.0001}
          />
          
          {/* Warm corner accent lights - further reduced intensity */}
          <pointLight 
            position={[6, 8, 4]} 
            intensity={0.08}
            color="#f5deb3"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.1}
            shadow-camera-far={25}
            distance={20}
            decay={2}
          />
          
          <pointLight 
            position={[-4, 7, -3]} 
            intensity={0.06}
            color="#f5deb3"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.1}
            shadow-camera-far={20}
            distance={18}
            decay={2}
          />
          
          {/* Workbench task lighting - warm sand - further reduced intensity */}
          <spotLight
            position={[2, 10, 3]}
            target-position={[0, 2, 0]}
            angle={Math.PI / 6}
            penumbra={0.4}
            intensity={0.2}
            color="#f5deb3"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={1}
            shadow-camera-far={30}
            distance={25}
            decay={1.5}
          />
          
          {/* Secondary workshop light - warm sand - further reduced intensity */}
          <spotLight
            position={[-3, 9, 2]}
            target-position={[-2, 1, -1]}
            angle={Math.PI / 5}
            penumbra={0.5}
            intensity={0.15}
            color="#f5deb3"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            distance={20}
            decay={1.8}
          />
          
            {/* 3D Workshop Room */}
            <Room 
              screenTexture="/images/ecran.png" 
              onZoomStateChange={handleZoomStateChange}
              onScreenZoomComplete={handleScreenZoomComplete}
            />
          
          {/* Fixed Camera Controller */}
          <FixedCameraController 
            onPositionChange={handlePositionChange} 
            isZoomed={isZoomed}
          />
        </Canvas>
      </Suspense>
    </main>
  )
}