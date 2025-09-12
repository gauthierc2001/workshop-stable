'use client'

import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Text } from '@react-three/drei'
import { Suspense, useEffect, useState, useRef, useMemo } from 'react'
import { Room, triggerCameraZoomBack } from '@/components/Room'
import { LoadingFallback } from '@/components/LoadingFallback'
import { AudioManager } from '@/components/AudioManager'
import { Vector3 } from 'three'

function LockedCameraController({ onPositionChange, isZoomed }: { onPositionChange: (pos: Vector3, target: Vector3) => void, isZoomed: boolean }) {
  const { camera } = useThree()
  const controlsRef = useRef<any>()

  useEffect(() => {
    // Only reset camera if not in zoomed state
    if (!isZoomed) {
      // Set NEW base camera position
      camera.position.set(436.107, 803.230, -2.268)
      
      // Set NEW base camera target
      if (controlsRef.current) {
        controlsRef.current.target.set(350.323, 783.240, 45.076)
        controlsRef.current.update()
      }
    } else {
      // When zoomed, maintain the zoom coordinates
      camera.position.set(-458.672, 446.169, 912.762)
      if (controlsRef.current) {
        controlsRef.current.target.set(-458.732, 446.169, 913.022)
        controlsRef.current.update()
      }
    }
  }, [camera, isZoomed])

  useFrame(() => {
    if (controlsRef.current && onPositionChange) {
      onPositionChange(camera.position.clone(), controlsRef.current.target?.clone() || new Vector3())
    }
  })

  return (
    <>
      {/* Simple center point indicator */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="red" />
      </mesh>
      
      <OrbitControls
        ref={controlsRef}
        target={isZoomed ? [-458.732, 446.169, 913.022] : [350.323, 783.240, 45.076]}
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
      />
    </>
  )
}

export default function Home() {
  const [cameraPosition, setCameraPosition] = useState(new Vector3(436.107, 803.230, -2.268))
  const [cameraTarget, setCameraTarget] = useState(new Vector3(350.323, 783.240, 45.076))
  const [isZoomed, setIsZoomed] = useState(false)
  const [showScreenUI, setShowScreenUI] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [showDocs, setShowDocs] = useState(false)
  
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
        window.open('https://x.com/UseKuboNet', '_blank')
        break
      case 'GitHub':
        alert('GitHub ouvert !')
        break
      case 'Docs':
        setShowDocs(true)
        break
      case 'App':
        setShowComingSoon(true)
        break
    }
  }

  return (
    <main className="w-full h-screen overflow-hidden relative">
      {/* Ambient Audio Manager with Mute Button */}
      <AudioManager ambientSrc="/sound/ambiant.mp3" volume={0.15} />
      
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
              {/* X Icon - top left of screen */}
              <button 
                onClick={() => handleIconClick('X')}
                className="absolute flex flex-col items-center justify-center hover:scale-110 transition-all duration-200"
                style={{
                  top: '-8vh',
                  left: '-15vw'
                }}
              >
                <div className="rounded flex items-center justify-center text-white" style={{
                  width: 'clamp(20px, 3vw, 24px)',
                  height: 'clamp(20px, 3vw, 24px)',
                  backgroundColor: '#EB773B',
                  marginBottom: '2px'
                }}>
                  <svg style={{ width: 'clamp(10px, 2vw, 12px)', height: 'clamp(10px, 2vw, 12px)' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="text-black font-medium" style={{ fontSize: 'clamp(10px, 1.5vw, 12px)' }}>X</span>
              </button>
              
              {/* GitHub Icon - below X */}
              <button 
                onClick={() => handleIconClick('GitHub')}
                className="absolute flex flex-col items-center justify-center hover:scale-110 transition-all duration-200"
                style={{
                  top: '2vh',
                  left: '-15vw'
                }}
              >
                <div className="rounded flex items-center justify-center text-white" style={{
                  width: 'clamp(20px, 3vw, 24px)',
                  height: 'clamp(20px, 3vw, 24px)',
                  backgroundColor: '#EB773B',
                  marginBottom: '2px'
                }}>
                  <svg style={{ width: 'clamp(10px, 2vw, 12px)', height: 'clamp(10px, 2vw, 12px)' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <span className="text-black font-medium" style={{ fontSize: 'clamp(10px, 1.5vw, 12px)' }}>GitHub</span>
              </button>
              
              {/* Docs Icon - top center */}
              <button 
                onClick={() => handleIconClick('Docs')}
                className="absolute flex flex-col items-center justify-center hover:scale-110 transition-all duration-200"
                style={{
                  top: '-8vh',
                  left: '-5vw'
                }}
              >
                <div className="rounded flex items-center justify-center text-white" style={{
                  width: 'clamp(20px, 3vw, 24px)',
                  height: 'clamp(20px, 3vw, 24px)',
                  backgroundColor: '#EB773B',
                  marginBottom: '2px'
                }}>
                  <svg style={{ width: 'clamp(10px, 2vw, 12px)', height: 'clamp(10px, 2vw, 12px)' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <span className="text-black font-medium" style={{ fontSize: 'clamp(10px, 1.5vw, 12px)' }}>Docs</span>
              </button>
              
              {/* Kubo v1 Icon - top right */}
              <button 
                onClick={() => handleIconClick('App')}
                className="absolute flex flex-col items-center justify-center hover:scale-110 transition-all duration-200"
                style={{
                  top: '-8vh',
                  left: '5vw'
                }}
              >
                <div className="rounded flex items-center justify-center overflow-hidden" style={{
                  width: 'clamp(20px, 3vw, 24px)',
                  height: 'clamp(20px, 3vw, 24px)',
                  backgroundColor: '#EB773B',
                  marginBottom: '2px'
                }}>
                  <img 
                    src="/images/logo.jpg" 
                    alt="Kubo Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-black font-medium" style={{ fontSize: 'clamp(10px, 1.5vw, 12px)' }}>Kubo v1</span>
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
            width: 'clamp(200px, 25vw, 280px)',
            maxHeight: 'clamp(200px, 30vh, 300px)'
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
                  src="/images/logo.jpg" 
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
              }}>Kubo v1</h2>
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
          <div className="bg-white rounded-lg shadow-2xl border-4 border-gray-800 relative overflow-hidden" style={{
            padding: 'clamp(6px, 1vw, 10px)',
            width: 'clamp(220px, 28vw, 320px)',
            height: 'clamp(200px, 28vh, 280px)'
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
                    src="/images/logo.jpg" 
                    alt="Kubo Logo" 
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
                }}>KuboNet Whitepaper</h1>
                <p style={{
                  fontSize: 'clamp(8px, 1.2vw, 10px)',
                  color: '#EB773B'
                }}>Robotics Internet Protocol</p>
              </div>
              
              <div className="max-w-none prose-responsive" style={{
                fontSize: 'clamp(8px, 1.1vw, 10px)',
                lineHeight: 'clamp(1.2, 1.3, 1.4)',
                color: '#000000'
              }}>
                <h2 style={{color: '#EB773B', fontWeight: 'bold', marginTop: 'clamp(8px, 1.2vw, 10px)', marginBottom: 'clamp(6px, 1vw, 8px)'}}>Abstract</h2>
                
                <p style={{marginBottom: 'clamp(8px, 1.2vw, 10px)'}}>KuboNet introduces a general-purpose blockchain protocol for robotics coordination designed to serve as the foundation for robotic interoperability across industries. KuboNet operates as the Robotics Internet Protocol defining a neutral auditable and verifiable layer that standardizes robotic identity task specification execution lifecycle and attestation.</p>
                
                <p style={{marginBottom: 'clamp(10px, 1.5vw, 12px)'}}>The goal of KuboNet is to deliver the robotic equivalent of TCP/IP enabling seamless and trustworthy machine-to-machine coordination.</p>

                <h2 style={{color: '#EB773B', fontWeight: 'bold', marginTop: 'clamp(12px, 1.8vw, 16px)', marginBottom: 'clamp(6px, 1vw, 8px)'}}>1. Introduction</h2>
                
                <p style={{marginBottom: 'clamp(8px, 1.2vw, 10px)'}}>Robotics is reaching an inflection point. With deployments spanning logistics agriculture healthcare domestic services and urban mobility robots are no longer isolated systems but part of distributed ecosystems. The absence of a common interoperability protocol prevents scaled collaboration and leads to vendor lock-in and high integration costs.</p>
                
                <p style={{marginBottom: 'clamp(10px, 1.5vw, 12px)'}}>KuboNet addresses this by introducing a blockchain coordination fabric leveraging immutability verifiability and neutrality to provide the first universal substrate for robotic interaction.</p>

                <h2 style={{color: '#EB773B', fontWeight: 'bold', marginTop: 'clamp(12px, 1.8vw, 16px)', marginBottom: 'clamp(6px, 1vw, 8px)'}}>2. Core Architecture</h2>
                
                <p style={{marginBottom: 'clamp(8px, 1.2vw, 10px)'}}>KuboNet defines four fundamental layers:</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)', paddingLeft: 'clamp(8px, 1.2vw, 12px)'}}><span style={{color: '#EB773B', fontWeight: 'bold'}}>Identity Layer:</span> Provides unique verifiable robot identifiers with capability metadata</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)', paddingLeft: 'clamp(8px, 1.2vw, 12px)'}}><span style={{color: '#EB773B', fontWeight: 'bold'}}>Task Layer:</span> Defines universal schema for work specification and allocation</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)', paddingLeft: 'clamp(8px, 1.2vw, 12px)'}}><span style={{color: '#EB773B', fontWeight: 'bold'}}>State Layer:</span> Tracks robotic execution lifecycle with standard states</p>
                
                <p style={{marginBottom: 'clamp(10px, 1.5vw, 12px)', paddingLeft: 'clamp(8px, 1.2vw, 12px)'}}><span style={{color: '#EB773B', fontWeight: 'bold'}}>Attestation Layer:</span> Anchors telemetry and execution proofs ensuring accountability</p>

                <h2 style={{color: '#EB773B', fontWeight: 'bold', marginTop: 'clamp(12px, 1.8vw, 16px)', marginBottom: 'clamp(6px, 1vw, 8px)'}}>3. Design Principles</h2>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#EB773B', fontWeight: 'bold'}}>Minimality:</span> Essential primitives ensuring robustness and wide adoption</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#EB773B', fontWeight: 'bold'}}>Neutrality:</span> Community-governed protocol designed for public good</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#EB773B', fontWeight: 'bold'}}>Verifiability:</span> Cryptographically signed timestamped and auditable interactions</p>
                
                <p style={{marginBottom: 'clamp(10px, 1.5vw, 12px)'}}><span style={{color: '#EB773B', fontWeight: 'bold'}}>Extensibility:</span> Higher-order protocols can build without base changes</p>

                <h2 style={{color: '#EB773B', fontWeight: 'bold', marginTop: 'clamp(12px, 1.8vw, 16px)', marginBottom: 'clamp(6px, 1vw, 8px)'}}>4. Security Framework</h2>
                
                <p style={{marginBottom: 'clamp(10px, 1.5vw, 12px)'}}>KuboNet implements comprehensive security measures including hierarchical key management with hardware secure modules stake-based sybil resistance and consensus anchoring for all lifecycle changes. This layered approach ensures robustness against common attack vectors.</p>

                <h2 style={{color: '#EB773B', fontWeight: 'bold', marginTop: 'clamp(12px, 1.8vw, 16px)', marginBottom: 'clamp(6px, 1vw, 8px)'}}>5. Industry Applications</h2>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#EB773B', fontWeight: 'bold'}}>Logistics:</span> Multi-vendor fleet interoperability</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#EB773B', fontWeight: 'bold'}}>Agriculture:</span> Seamless collaboration between tractors drones and sensors</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#EB773B', fontWeight: 'bold'}}>Urban Mobility:</span> Transparent infrastructure sharing for delivery robots</p>
                
                <p style={{marginBottom: 'clamp(10px, 1.5vw, 12px)'}}><span style={{color: '#EB773B', fontWeight: 'bold'}}>Regulatory:</span> Tamper-proof performance logs for auditors and insurers</p>

                <h2 style={{color: '#EB773B', fontWeight: 'bold', marginTop: 'clamp(12px, 1.8vw, 16px)', marginBottom: 'clamp(6px, 1vw, 8px)'}}>6. Standards Integration</h2>
                
                <p style={{marginBottom: 'clamp(10px, 1.5vw, 12px)'}}>KuboNet seamlessly integrates with existing frameworks including ROS2 for middleware compatibility OPC-UA for industrial device descriptions and ISO safety standards. This ensures KuboNet complements rather than replaces existing infrastructure.</p>

                <h2 style={{color: '#EB773B', fontWeight: 'bold', marginTop: 'clamp(12px, 1.8vw, 16px)', marginBottom: 'clamp(6px, 1vw, 8px)'}}>7. Development Roadmap</h2>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#EB773B', fontWeight: 'bold'}}>Phase 1:</span> Identity registry and metadata standards</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#EB773B', fontWeight: 'bold'}}>Phase 2:</span> Task schema implementation with open APIs</p>
                
                <p style={{marginBottom: 'clamp(6px, 0.8vw, 8px)'}}><span style={{color: '#EB773B', fontWeight: 'bold'}}>Phase 3:</span> State machine tracking with lifecycle proofs</p>
                
                <p style={{marginBottom: 'clamp(10px, 1.5vw, 12px)'}}><span style={{color: '#EB773B', fontWeight: 'bold'}}>Phase 4:</span> Cross-industry pilots and standards body engagement</p>

                <h2 style={{color: '#EB773B', fontWeight: 'bold', marginTop: 'clamp(12px, 1.8vw, 16px)', marginBottom: 'clamp(6px, 1vw, 8px)'}}>8. Conclusion</h2>
                
                <p style={{marginBottom: 'clamp(8px, 1.2vw, 10px)'}}>KuboNet establishes the foundational blockchain protocol for robotics coordination. By combining identity task schemas state machines and attestations it creates a universal substrate enabling robotic interoperability across vendor ecosystems.</p>
                
                <p style={{marginBottom: 'clamp(8px, 1.2vw, 10px)'}}>Just as TCP/IP enabled the Internet by abstracting heterogeneous systems KuboNet enables the robotic economy by providing the universal routing fabric for the autonomous era.</p>
              </div>
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
            position: [436.107, 803.230, -2.268]
          }}
          shadows={{
            enabled: true,
            type: "PCFSoftShadowMap"
          }}
          dpr={[1, 2]}
          performance={{ min: 0.5 }}
          gl={{
            shadowMap: {
              enabled: true,
              type: "PCFSoftShadowMap"
            }
          }}
        >
          {/* Very dim ambient lighting - neon will be main source */}
          <ambientLight intensity={0.1} color="#752B0C" />
          
          {/* Minimal hemisphere light */}
          <hemisphereLight 
            skyColor="#752B0C"
            groundColor="#2a0f05"
            intensity={0.15}
          />
          
          {/* Dimmed overhead light - neon is main source */}
          <directionalLight 
            position={[8, 12, 6]} 
            intensity={0.3}
            color="#752B0C"
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
          
          {/* Very dim corner lights */}
          <pointLight 
            position={[6, 8, 4]} 
            intensity={0.2}
            color="#752B0C"
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
            intensity={0.15}
            color="#752B0C"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={0.1}
            shadow-camera-far={20}
            distance={18}
            decay={2}
          />
          
          {/* Workbench task lighting */}
          <spotLight
            position={[2, 10, 3]}
            target-position={[0, 2, 0]}
            angle={Math.PI / 6}
            penumbra={0.4}
            intensity={0.56}
            color="#752B0C"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={1}
            shadow-camera-far={30}
            distance={25}
            decay={1.5}
          />
          
          {/* Secondary workshop light */}
          <spotLight
            position={[-3, 9, 2]}
            target-position={[-2, 1, -1]}
            angle={Math.PI / 5}
            penumbra={0.5}
            intensity={0.4}
            color="#752B0C"
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
          
          {/* Locked Camera Controller */}
          <LockedCameraController onPositionChange={handlePositionChange} isZoomed={isZoomed} />
        </Canvas>
      </Suspense>
    </main>
  )
}