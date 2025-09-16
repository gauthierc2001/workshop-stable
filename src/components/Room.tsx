'use client'

import { useGLTF } from '@react-three/drei'
import { useEffect, useState, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface RoomProps {
  position?: [number, number, number]
  scale?: number
  screenTexture?: string // Path to custom screen texture
  onZoomStateChange?: (isZoomed: boolean) => void
  onScreenZoomComplete?: () => void
}

// Add a function to trigger zoom back from outside
let triggerZoomBack: (() => void) | null = null

export const triggerCameraZoomBack = () => {
  if (triggerZoomBack) {
    triggerZoomBack()
  }
}

export function Room({ position = [0, 0, 0], scale = 1, screenTexture, onZoomStateChange, onScreenZoomComplete }: RoomProps) {
  const { scene, materials } = useGLTF('/models/workshop/scene.gltf')
  const [hoveredObject, setHoveredObject] = useState<string | null>(null)
  const [isZoomingToComputer, setIsZoomingToComputer] = useState(false)
  const [isZoomedIn, setIsZoomedIn] = useState(false)
  const { camera, controls } = useThree()
  
  // Clone the scene to avoid modifying the original
  const clonedScene = useMemo(() => scene.clone(), [scene])
  
  // Store camera positions for zoom animation (UPDATED TO NEW FIXED POSITION)
  const originalCameraPosition = useRef(new THREE.Vector3(-160.56, 686.20, 98.60))
  const originalCameraTarget = useRef(new THREE.Vector3(-634.75, 669.00, 820.31))
  const computerPosition = useRef<THREE.Vector3 | null>(null)
  const computerTargetPosition = useRef(new THREE.Vector3(-458.672, 446.169, 912.762))
  const computerTargetLookAt = useRef(new THREE.Vector3(-458.732, 446.169, 913.022))
  const animationProgress = useRef(0)
  
  // Tube light random blinking state
  const tubeLightRef = useRef<THREE.Mesh | null>(null)
  const tubeLightSource = useRef<THREE.PointLight | null>(null)
  const blinkTime = useRef(0)
  const nextBlinkDuration = useRef(3.0) // Random duration between 2-8s (doubled)
  const isBlinking = useRef(false)
  
  // Glitchy effect state
  const glitchIntensity = useRef(0)
  const glitchTime = useRef(0)
  const isGlitching = useRef(false)
  const visualDelay = useRef(0)
  const pendingStateChange = useRef<boolean | null>(null)
  
  // Neon sound duration tracking
  const neonSoundDuration = useRef(0)
  const neonOnStartTime = useRef(0)
  
  // Screen light emission
  const screenLightSource = useRef<THREE.PointLight | null>(null)
  
  // Audio setup for click sound
  const clickAudio = useMemo(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sound/click.mp3')
      audio.preload = 'auto'
      audio.volume = 0.7 // Adjust volume as needed
      audio.loop = false
      
      // Add loading event listeners
      audio.addEventListener('canplaythrough', () => {
        console.log('🔊 Click sound loaded successfully')
      })
      
      audio.addEventListener('error', (error) => {
        console.error('❌ Click sound loading failed:', error)
      })
      
      return audio
    }
    return null
  }, [])

  // Audio setup for neon sound
  const neonAudio = useMemo(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('/sound/neon.mp3')
      audio.preload = 'auto'
      audio.volume = 0.6 // Adjust volume as needed
      audio.loop = false
      
      // Add loading event listeners
      audio.addEventListener('canplaythrough', () => {
        console.log('🔊 Neon sound loaded successfully')
        // Get the duration when loaded
        neonSoundDuration.current = audio.duration || 0
        console.log('🔊 Neon sound duration:', neonSoundDuration.current.toFixed(2) + 's')
      })
      
      audio.addEventListener('error', (error) => {
        console.error('❌ Neon sound loading failed:', error)
      })
      
      // Add event listener for when sound ends
      audio.addEventListener('ended', () => {
        console.log('🔊 Neon sound ended, turning off neon')
        // Force turn off neon when sound ends
        if (!isBlinking.current) {
          isBlinking.current = true
          console.log('💡 Neon turned OFF due to sound ending')
        }
      })
      
      return audio
    }
    return null
  }, [])

  // Create outline material for hover effect (warm sand tone) - clean precise glow
  const outlineMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xf5deb3), // Warm sand color
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.8,
      emissive: new THREE.Color(0xf5deb3), // Warm sand emissive glow
      emissiveIntensity: 0.4 // Moderate emissive intensity for clean glow
    }), []
  )

  useEffect(() => {
    // Replace screen texture if provided
    if (screenTexture) {
      const textureLoader = new THREE.TextureLoader()
      const customTexture = textureLoader.load(screenTexture, (texture) => {
        // Configure texture properly for screen display
        texture.flipY = false // Important for GLTF models
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        texture.magFilter = THREE.LinearFilter
        texture.minFilter = THREE.LinearMipmapLinearFilter
        texture.generateMipmaps = true
        
        console.log('✅ Custom screen texture loaded:', screenTexture)
        console.log('📐 Texture size:', texture.image.width, 'x', texture.image.height)
        
        // Force material update after texture is fully loaded
        Object.values(materials).forEach((material: any) => {
          if (material.name === 'Screen') {
            material.map = texture
            material.emissiveMap = texture
            material.needsUpdate = true
            console.log('🖥️ Screen material updated with new texture')
          }
        })
      }, undefined, (error) => {
        console.error('❌ Error loading custom screen texture:', error)
      })

      // Don't apply texture immediately, wait for loading to complete
      customTexture.colorSpace = THREE.SRGBColorSpace
    }

    // Optimize materials for better performance and orange lighting compatibility
    Object.values(materials).forEach((material: any) => {
      if (material.map) {
        material.map.minFilter = THREE.LinearMipmapLinearFilter
        material.map.magFilter = THREE.LinearFilter
        material.map.generateMipmaps = true
      }
      if (material.normalMap) {
        material.normalMap.minFilter = THREE.LinearMipmapLinearFilter
        material.normalMap.magFilter = THREE.LinearFilter
      }
      if (material.roughnessMap) {
        material.roughnessMap.minFilter = THREE.LinearMipmapLinearFilter
        material.roughnessMap.magFilter = THREE.LinearFilter
      }
      
      // Enhance materials for strong orange lighting response
      if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
        // Significantly increase metalness for better orange reflection
        material.metalness = Math.min((material.metalness || 0) + 0.3, 0.9)
        
        // Reduce roughness for more pronounced light interaction
        material.roughness = Math.max((material.roughness || 0.5) - 0.2, 0.05)
        
        // Tint the base color toward warm sand for better harmony
        if (material.color) {
          // Mix with warm sand tint
          const sandTint = new THREE.Color(0xf5deb3)
          material.color.lerp(sandTint, 0.15)
          material.color.multiplyScalar(1.2)
        }
        
        // Ensure materials are responsive to lighting
        material.needsUpdate = true
      }
      
      // For basic materials, apply warm sand tinting directly
      if (material.isMeshBasicMaterial || material.isMeshLambertMaterial) {
        if (material.color) {
          const sandTint = new THREE.Color(0xf5deb3)
          material.color.lerp(sandTint, 0.2)
        }
        material.needsUpdate = true
      }
    })

    // Enable shadows and optimize meshes, and add hover capabilities
    clonedScene.traverse((child) => {
      // Log all object names to identify the neon light
      console.log('🔍 Object found:', child.name, child.type)
      
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
        child.frustumCulled = true
        
          // Log screen dimensions for texture sizing
          if (child.name.includes('Screen')) {
            const box = new THREE.Box3().setFromObject(child)
            const size = box.getSize(new THREE.Vector3())
            const aspectRatio = size.x / size.y
            
            console.log('🖥️ ===== COMPUTER SCREEN DIMENSIONS =====')
            console.log(`Screen Object: ${child.name}`)
            console.log(`3D Dimensions: ${size.x.toFixed(4)} x ${size.y.toFixed(4)} x ${size.z.toFixed(4)} units`)
            console.log(`Aspect Ratio: ${aspectRatio.toFixed(4)} (${aspectRatio > 1 ? 'landscape' : 'portrait'})`)
            console.log('=========================================')
            
            // Get UV coordinates info
            const uvAttribute = child.geometry.attributes.uv
            if (uvAttribute) {
              const uvArray = Array.from(uvAttribute.array) as number[]
              const minU = Math.min(...uvArray.filter((_, i) => i % 2 === 0))
              const maxU = Math.max(...uvArray.filter((_, i) => i % 2 === 0))
              const minV = Math.min(...uvArray.filter((_, i) => i % 2 === 1))
              const maxV = Math.max(...uvArray.filter((_, i) => i % 2 === 1))
              
              console.log(`UV Mapping: U[${minU.toFixed(3)}, ${maxU.toFixed(3)}] V[${minV.toFixed(3)}, ${maxV.toFixed(3)}]`)
            }
            
            // Multiple recommended sizes based on common screen ratios
            console.log('📐 RECOMMENDED IMAGE SIZES:')
            
            // Based on actual aspect ratio
            const sizes = [512, 1024, 1536, 2048]
            sizes.forEach(width => {
              const height = Math.round(width / aspectRatio)
              console.log(`- ${width}x${height} pixels (${aspectRatio.toFixed(2)}:1 ratio)`)
            })
            
            // Common screen ratios for comparison
            console.log('📺 Common ratios for reference:')
            console.log('- 16:9 (widescreen): 1024x576, 1920x1080')
            console.log('- 4:3 (classic): 1024x768, 1280x960') 
            console.log('- 16:10 (monitor): 1024x640, 1920x1200')
            console.log('=========================================')
          }
        
        // Check if this is the computer, mouse, screen, or tube light object
        const isHoverableObject = child.name.includes('Computer') || child.name.includes('Mouse2') || child.name.includes('Screen')
        const isTubeLight = child.name === 'Cylinder047_TubeLight_0'
        const isScreen = child.name.includes('Screen')
        
        // Handle tube light identification and setup
        if (isTubeLight) {
          console.log('💡 TUBE LIGHT FOUND:', child.name)
          tubeLightRef.current = child
          
          // Setup flickering neon material (warm sand tone)
          if (child.material) {
            child.material.color.setHex(0xf5deb3) // Warm sand color
            child.material.emissive.setHex(0xf5deb3) // Warm sand emissive
            ;(child.material as any).emissiveIntensity = 0.8
            child.material.needsUpdate = true
            
            console.log('🔥 Tube light configured with warm sand flickering material')
          }
          
          // Create POWERFUL neon lighting system that REALLY lights the room
          
          // Get tube position and create world coordinates
          const box = new THREE.Box3().setFromObject(child)
          const center = box.getCenter(new THREE.Vector3())
          
          // Convert to world position
          const worldPos = new THREE.Vector3()
          child.localToWorld(worldPos.copy(center))
          
          // MAIN LIGHT - 70% of original (30% more reduction)
          const mainLight = new THREE.PointLight(0xf5deb3, 70.0, 50, 0.1)
          mainLight.position.copy(worldPos)
          mainLight.castShadow = true
          mainLight.shadow.mapSize.width = 1024
          mainLight.shadow.mapSize.height = 1024
          mainLight.shadow.camera.near = 0.1
          mainLight.shadow.camera.far = 50
          
          // Add to root scene for maximum effect
          clonedScene.add(mainLight)
          tubeLightSource.current = mainLight
          
          // Additional AREA LIGHTING - 70% of original (30% more reduction)
          const areaLights = []
          for (let i = 0; i < 5; i++) {
            const areaLight = new THREE.PointLight(0xf5deb3, 28.0, 25, 0.2)
            const spreadPos = worldPos.clone()
            spreadPos.x += (i - 2) * 0.4 // Spread along tube length
            spreadPos.y += Math.sin(i) * 0.1 // Slight vertical variation
            areaLight.position.copy(spreadPos)
            areaLight.castShadow = false // Only main light casts shadows
            
            clonedScene.add(areaLight)
            areaLights.push(areaLight)
          }
          
          // DIRECTIONAL FILL LIGHT - 70% of original (30% more reduction)
          const fillLight = new THREE.DirectionalLight(0xf5deb3, 0.7)
          fillLight.position.copy(worldPos)
          fillLight.position.y += 2
          fillLight.target.position.set(worldPos.x, worldPos.y - 3, worldPos.z)
          fillLight.castShadow = false
          
          clonedScene.add(fillLight)
          clonedScene.add(fillLight.target)
          areaLights.push(fillLight) // Store in array for control
          
          // Store area lights for animation
          ;(tubeLightSource.current as any).areaLights = areaLights
          
          console.log('🔥 POWERFUL WARM SAND LIGHTING SYSTEM created:')
          console.log('  Main light:', mainLight.intensity, 'at', worldPos)
          console.log('  Area lights:', areaLights.length - 1, 'point lights + 1 directional')
          console.log('  Total power: ~', mainLight.intensity + (areaLights.length * 60))
        }
        
        // Handle screen brightness and white light emission
        if (isScreen) {
          console.log('🖥️ SCREEN FOUND:', child.name)
          
          // Make screen VERY bright with warm sand glow
          if (child.material) {
            child.material.emissive = new THREE.Color(0xf5deb3) // Warm sand emissive
            ;(child.material as any).emissiveIntensity = 3.5 // Much brighter
            child.material.needsUpdate = true
            console.log('✨ Screen made VERY bright with warm sand glow')
          }
          
          // Create POWERFUL white light emission from screen
          const screenBox = new THREE.Box3().setFromObject(child)
          const screenCenter = screenBox.getCenter(new THREE.Vector3())
          
          // Convert to world position for accurate placement
          const worldScreenPos = new THREE.Vector3()
          child.localToWorld(worldScreenPos.copy(screenCenter))
          
          // Position light slightly in front of screen
          worldScreenPos.z += 0.3
          
          // MAIN SCREEN LIGHT - Very powerful warm sand light
          const screenLight = new THREE.PointLight(0xf5deb3, 25.0, 15, 0.3)
          screenLight.position.copy(worldScreenPos)
          screenLight.castShadow = true
          screenLight.shadow.mapSize.width = 512
          screenLight.shadow.mapSize.height = 512
          
          clonedScene.add(screenLight)
          screenLightSource.current = screenLight
          
          // Additional AREA LIGHTING around the screen for realistic glow
          const screenAreaLights = []
          for (let i = 0; i < 3; i++) {
            const areaLight = new THREE.PointLight(0xf5deb3, 12.0, 8, 0.5)
            const spreadPos = worldScreenPos.clone()
            spreadPos.x += (i - 1) * 0.2 // Spread horizontally
            spreadPos.y += Math.cos(i) * 0.1 // Slight vertical variation
            areaLight.position.copy(spreadPos)
            areaLight.castShadow = false
            
            clonedScene.add(areaLight)
            screenAreaLights.push(areaLight)
          }
          
          // Store area lights in main light for control
          ;(screenLight as any).areaLights = screenAreaLights
          
          console.log('💡 POWERFUL warm sand screen lighting system created:')
          console.log('  Main light:', screenLight.intensity, 'at', worldScreenPos)
          console.log('  Area lights:', screenAreaLights.length, 'additional lights')
          console.log('  Total screen power:', screenLight.intensity + (screenAreaLights.length * 12))
        }
        
        if (isHoverableObject) {
          // Store original material
          if (!child.userData.originalMaterial) {
            child.userData.originalMaterial = child.material
          }
          
          // Create outline mesh for this object - clean precise glow
          const outlineGeometry = child.geometry.clone()
          const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial.clone())
          outlineMesh.scale.setScalar(1.03) // Precise, clean outline that follows the shape
          outlineMesh.visible = false
          outlineMesh.userData.isOutline = true
          outlineMesh.userData.parentName = child.name
          
          // Add outline as child of the original mesh
          child.add(outlineMesh)
          child.userData.outlineMesh = outlineMesh
          
          // Create LARGER invisible collision box for better hover detection
          const bbox = new THREE.Box3().setFromObject(child)
          const size = bbox.getSize(new THREE.Vector3())
          const center = bbox.getCenter(new THREE.Vector3())
          
          // Create much larger invisible geometry for easier detection
          const hoverGeometry = new THREE.BoxGeometry(
            size.x * 2.0, // 100% larger for easier hover detection
            size.y * 2.0,
            size.z * 2.0
          )
          const hoverMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.0, // Completely invisible
            visible: false // Hidden from view but still detects raycasting
          })
          
          const hoverMesh = new THREE.Mesh(hoverGeometry, hoverMaterial)
          hoverMesh.position.copy(center)
          hoverMesh.userData.isHoverZone = true
          hoverMesh.userData.parentName = child.name
          hoverMesh.userData.originalObject = child
          
          // Add to scene for detection
          clonedScene.add(hoverMesh)
          child.userData.hoverMesh = hoverMesh
          
          console.log('🎯 Enhanced hover detection zone created for:', child.name)
          
          // If this is the computer, store its position for zoom animation
          if (child.name.includes('Computer') && !computerPosition.current) {
            const computerBox = new THREE.Box3().setFromObject(child)
            const computerCenter = computerBox.getCenter(new THREE.Vector3())
            computerPosition.current = computerCenter.clone()
            
            console.log('🖥️ Computer position found for zoom:', computerPosition.current)
          }
        }
        
        // Enhance mesh material for orange lighting and ensure it receives light
        if (child.material && !child.material.userData.optimizedForOrange) {
          // Make sure material can receive lighting
          if (child.material.isMeshBasicMaterial) {
            // Convert MeshBasicMaterial to MeshStandardMaterial for lighting
            const newMaterial = new THREE.MeshStandardMaterial({
              map: child.material.map,
              color: child.material.color,
              transparent: child.material.transparent,
              opacity: child.material.opacity
            })
            child.material = newMaterial
            console.log('🔄 Converted', child.name, 'to MeshStandardMaterial for lighting')
          }
          
          // Enhance for orange light reception
          if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
            child.material.roughness = 0.7 // Good for light reflection
            child.material.metalness = 0.1 // Slightly metallic
          }
          
          child.material.userData.optimizedForOrange = true
          child.material.needsUpdate = true
        }
      }
    })
  }, [clonedScene, materials, outlineMaterial, screenTexture])

  // Smooth camera animation towards computer
  useFrame((state, delta) => {
    if (isZoomingToComputer) {
      // Increase animation progress (slower for more cinematic feel)
      animationProgress.current += delta * 0.5
      
      if (animationProgress.current >= 1) {
        animationProgress.current = 1
        
        // Re-enable OrbitControls and sync with exact coordinates
        if (controls && 'target' in controls) {
          ;(controls as any).target.set(-458.732, 446.169, 913.022)
          ;(controls as any).update()
          ;(controls as any).enabled = true
        }
        
        // Notify parent that we're now zoomed in
        onZoomStateChange?.(true)
        
        // Set internal zoomed state
        setIsZoomedIn(true)
        
        // Hide all hover outlines when zoomed in
        toggleHoverGroup(false)
        setHoveredObject(null)
        document.body.style.cursor = 'default'
        
        // Notify that screen zoom is complete for UI overlay
        onScreenZoomComplete?.()
        
        setIsZoomingToComputer(false)
        return
      }
      
      // Smooth easing function for natural animation feel
      const t = animationProgress.current
      const easedProgress = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      
      // Smooth animation from current camera position to computer target
      camera.position.lerpVectors(originalCameraPosition.current, computerTargetPosition.current, easedProgress)
      
      // Also smoothly interpolate where the camera is looking during animation
      const currentLookTarget = new THREE.Vector3()
      currentLookTarget.lerpVectors(originalCameraTarget.current, computerTargetLookAt.current, easedProgress)
      camera.lookAt(currentLookTarget)
    }
    
    // Tube light blinking animation with sound-synchronized timing
    if (tubeLightRef.current && tubeLightSource.current) {
      blinkTime.current += delta
      glitchTime.current += delta
      visualDelay.current += delta
      
      // Check if it's time for next blink event
      if (blinkTime.current >= nextBlinkDuration.current) {
        // Start a new blink cycle
        const wasBlinking = isBlinking.current
        const newState = !isBlinking.current
        
        // Play neon sound ONLY when turning ON
        if (neonAudio && !newState) { // newState is false when turning ON
          neonAudio.currentTime = 0
          neonAudio.play().catch((error) => {
            console.log('Neon audio play failed:', error)
          })
          console.log('🔊 Playing neon sound for turning ON')
          
          // Record when neon turned on
          neonOnStartTime.current = blinkTime.current
        }
        
        // Stop neon sound instantly when turning OFF
        if (neonAudio && newState && !wasBlinking) { // Turning OFF
          neonAudio.pause()
          neonAudio.currentTime = 0
          console.log('🔊 Neon sound stopped instantly')
        }
        
        // Set up delayed visual change (50ms after sound)
        pendingStateChange.current = newState
        visualDelay.current = 0
        
        // Start glitch effect IMMEDIATELY
        isGlitching.current = true
        glitchTime.current = 0
        glitchIntensity.current = 1.0
        
        // Reset timing - use sound duration if available, otherwise fallback
        blinkTime.current = 0
        if (neonSoundDuration.current > 0 && !newState) {
          // When turning ON, use sound duration + small buffer
          nextBlinkDuration.current = neonSoundDuration.current + 0.5
          console.log('💡 Using sound duration:', neonSoundDuration.current.toFixed(2) + 's')
        } else {
          // When turning OFF, use random longer duration
          nextBlinkDuration.current = 2.0 + Math.random() * 6.0 // 2-8 seconds
        }
        
        console.log('💡 Neon blink event scheduled:', newState ? 'OFF' : 'ON', 'Next in:', nextBlinkDuration.current.toFixed(2) + 's')
      }
      
      // Apply visual change after delay
      if (pendingStateChange.current !== null && visualDelay.current >= 0.05) {
        isBlinking.current = pendingStateChange.current
        pendingStateChange.current = null
        console.log('💡 Visual state applied:', isBlinking.current ? 'OFF' : 'ON')
      }
      
      // Glitch effect animation
      if (isGlitching.current) {
        glitchTime.current += delta
        const glitchDuration = 0.3 // Glitch for 300ms
        
        if (glitchTime.current < glitchDuration) {
          // Create glitchy intensity variation
          const glitchProgress = glitchTime.current / glitchDuration
          glitchIntensity.current = 1.0 - glitchProgress + Math.sin(glitchTime.current * 50) * 0.3 * (1 - glitchProgress)
          
          // Apply glitch to neon material
          if (tubeLightRef.current.material) {
            const baseIntensity = isBlinking.current ? 0.0 : 1.5
            ;(tubeLightRef.current.material as any).emissiveIntensity = baseIntensity + (glitchIntensity.current * 0.5)
          }
        } else {
          isGlitching.current = false
          glitchIntensity.current = 0
        }
      }
      
      if (!isBlinking.current) {
        // Neon is ON - Normal lighting with glitch effect
        const baseIntensity = 1.5
        const glitchModifier = isGlitching.current ? glitchIntensity.current * 0.5 : 0
        ;(tubeLightRef.current.material as any).emissiveIntensity = baseIntensity + glitchModifier
        
        // Main light at 70% power with glitch variation
        const baseIntensityLight = 87.5
        const glitchLightModifier = isGlitching.current ? glitchIntensity.current * 20 : 0
        tubeLightSource.current.intensity = baseIntensityLight + glitchLightModifier
        tubeLightSource.current.visible = true
        
        // Area lights - 70% power with glitch variation
        if ((tubeLightSource.current as any).areaLights) {
          ;(tubeLightSource.current as any).areaLights.forEach((light: any, index: number) => {
            if (light.isDirectionalLight) {
              // Directional fill light - 70% power with glitch
              const baseIntensityDir = 1.05
              const glitchDirModifier = isGlitching.current ? glitchIntensity.current * 0.3 : 0
              light.intensity = baseIntensityDir + glitchDirModifier
              light.visible = true
            } else {
              // Point lights - 70% power with glitch
              const baseIntensityPoint = 35.0
              const glitchPointModifier = isGlitching.current ? glitchIntensity.current * 10 : 0
              light.intensity = baseIntensityPoint + glitchPointModifier
              light.visible = true
            }
          })
        }
      } else {
        // Neon is OFF - Complete darkness during blink
        ;(tubeLightRef.current.material as any).emissiveIntensity = 0.0
        
        // Turn off main light
        tubeLightSource.current.intensity = 0.0
        tubeLightSource.current.visible = false
        
        // Turn off ALL area lights
        if ((tubeLightSource.current as any).areaLights) {
          ;(tubeLightSource.current as any).areaLights.forEach((light: any) => {
            light.intensity = 0.0
            light.visible = false
          })
        }
      }
    }
  })

  // Function to zoom back to original position
  const zoomBackToOriginal = () => {
    console.log('🔙 Zooming back to workshop overview')
    setIsZoomingToComputer(false)
    animationProgress.current = 0
    
    // Set back to new fixed position and update controls target
    camera.position.copy(originalCameraPosition.current)
    if (controls && 'target' in controls) {
      ;(controls as any).target.copy(originalCameraTarget.current)
      ;(controls as any).update()
    }
    
    // Set internal zoomed state back to false
    setIsZoomedIn(false)
    
    // Notify parent that we're back to overview
    onZoomStateChange?.(false)
  }

  // Set up the external trigger function
  useEffect(() => {
    triggerZoomBack = zoomBackToOriginal
    return () => {
      triggerZoomBack = null
    }
  }, [zoomBackToOriginal])

  // Function to show/hide outlines for PC, mouse, and screen
  const toggleHoverGroup = (show: boolean) => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const isHoverableObject = child.name.includes('Computer') || child.name.includes('Mouse2') || child.name.includes('Screen')
        
        if (isHoverableObject && child.userData.outlineMesh) {
          child.userData.outlineMesh.visible = show
        }
      }
    })
  }

  // Handle hover events
  const handlePointerEnter = (event: any) => {
    event.stopPropagation()
    const mesh = event.object
    
    // Don't show hover effects when zoomed in
    if (isZoomedIn) return
    
    // Check if this is a hoverable object or hover zone
    const isHoverZone = mesh.userData.isHoverZone
    const isDirectHover = mesh.name.includes('Computer') || mesh.name.includes('Mouse2') || mesh.name.includes('Screen')
    
    if (isHoverZone || isDirectHover) {
      setHoveredObject('pc-setup-group')
      
      // Show outline for PC, mouse, and screen
      toggleHoverGroup(true)
      
      // Change cursor to pointer
      document.body.style.cursor = 'pointer'
      
      if (isHoverZone) {
        console.log('🎯 Hover detected on enhanced zone for:', mesh.userData.parentName)
      }
    }
  }

  const handlePointerLeave = (event: any) => {
    event.stopPropagation()
    const mesh = event.object
    
    // Don't process hover leave when zoomed in
    if (isZoomedIn) return
    
    // Check if this is a hoverable object or hover zone
    const isHoverZone = mesh.userData.isHoverZone
    const isDirectHover = mesh.name.includes('Computer') || mesh.name.includes('Mouse2') || mesh.name.includes('Screen')
    
    if (isHoverZone || isDirectHover) {
      setHoveredObject(null)
      
      // Hide outline for PC, mouse, and screen
      toggleHoverGroup(false)
      
      // Reset cursor
      document.body.style.cursor = 'default'
    }
  }

  // Handle click events
  const handleClick = (event: any) => {
    event.stopPropagation()
    const mesh = event.object
    
    // Log clicked object details for identification
    console.log('🎯 CLICKED OBJECT:')
    console.log('Name:', mesh.name)
    console.log('Type:', mesh.type)
    console.log('Material:', mesh.material?.name)
    console.log('Position:', mesh.position)
    console.log('Full object:', mesh)
    console.log('-------------------')
    
    // Check if this is a clickable object or hover zone
    const isHoverZone = mesh.userData.isHoverZone
    const isDirectClick = mesh.name.includes('Computer') || mesh.name.includes('Mouse2') || mesh.name.includes('Screen')
    
    if (isHoverZone || isDirectClick) {
      // Play click sound
      if (clickAudio) {
        clickAudio.currentTime = 0 // Reset to start for rapid clicks
        clickAudio.play().catch((error) => {
          console.log('Audio play failed:', error)
          // Audio might be blocked by browser, user needs to interact first
        })
      }
      
      // Start zoom animation to computer if clicking on computer/screen or their hover zones
      const shouldZoom = (mesh.name.includes('Computer') || mesh.name.includes('Screen')) || 
                        (isHoverZone && (mesh.userData.parentName.includes('Computer') || mesh.userData.parentName.includes('Screen')))
      
      if (shouldZoom && !isZoomingToComputer && !isZoomedIn) {
        console.log('🎬 Starting cinematic zoom to computer')
        animationProgress.current = 0
        // Disable OrbitControls during animation to prevent fighting
        if (controls) {
          ;(controls as any).enabled = false
        }
        setIsZoomingToComputer(true)
      }
    }
  }

  // Handle ESC key and double-click to zoom back
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isZoomingToComputer) {
        console.log('🔙 ESC pressed: Zooming back to workshop overview')
        zoomBackToOriginal()
      }
    }
    
    const handleDoubleClick = () => {
      if (isZoomingToComputer) {
        console.log('🔙 Double-click: Zooming back to workshop overview')
        zoomBackToOriginal()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    window.addEventListener('dblclick', handleDoubleClick)
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('dblclick', handleDoubleClick)
    }
  }, [isZoomingToComputer])

  return (
    <primitive 
      object={clonedScene} 
      position={position} 
      scale={scale}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    />
  )
}

// Preload the model for better performance
useGLTF.preload('/models/workshop/scene.gltf')
