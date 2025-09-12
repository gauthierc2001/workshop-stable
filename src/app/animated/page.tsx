'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense } from 'react'
import { Room } from '@/components/Room'
import { LoadingFallback } from '@/components/LoadingFallback'
import { AnimatedWrapper } from '@/components/AnimatedWrapper'
import { AudioManager } from '@/components/AudioManager'

export default function AnimatedPage() {
  return (
    <AnimatedWrapper>
      <main className="w-full h-screen overflow-hidden relative">
        {/* Ambient Audio Manager with Mute Button */}
        <AudioManager ambientSrc="/sound/ambiant.mp3" volume={0.15} />
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            className="w-full h-full"
            camera={{ 
              position: [8, 6, 8], 
              fov: 50,
              near: 0.1,
              far: 1000
            }}
            shadows
            dpr={[1, 2]}
            performance={{ min: 0.5 }}
          >
            {/* Lighting Setup */}
            <ambientLight intensity={0.3} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            <pointLight 
              position={[5, 8, 5]} 
              intensity={0.8}
              castShadow
            />
            
            {/* Environment for realistic reflections */}
            <Environment preset="warehouse" />
            
            {/* 3D Workshop Room */}
            <Room screenTexture="/images/ecran.png" />
            
            {/* Camera Controls */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={50}
              maxPolarAngle={Math.PI / 2}
              dampingFactor={0.05}
              enableDamping={true}
            />
          </Canvas>
        </Suspense>
      </main>
    </AnimatedWrapper>
  )
}
