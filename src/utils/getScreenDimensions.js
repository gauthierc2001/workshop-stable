// Utility to extract screen dimensions from the GLTF model
// This will help determine the exact aspect ratio needed for the texture

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export function getScreenDimensions() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    
    loader.load('/models/workshop/scene.gltf', (gltf) => {
      let screenMesh = null
      
      // Find the screen mesh
      gltf.scene.traverse((child) => {
        if (child.isMesh && child.name.includes('Screen')) {
          screenMesh = child
        }
      })
      
      if (screenMesh && screenMesh.geometry) {
        // Get bounding box
        const box = new THREE.Box3().setFromObject(screenMesh)
        const size = box.getSize(new THREE.Vector3())
        
        // Get UV coordinates to understand texture mapping
        const uvAttribute = screenMesh.geometry.attributes.uv
        
        const dimensions = {
          width: size.x,
          height: size.y,
          depth: size.z,
          aspectRatio: size.x / size.y,
          uvCoords: uvAttribute ? Array.from(uvAttribute.array) : null
        }
        
        console.log('Screen Dimensions:', dimensions)
        resolve(dimensions)
      } else {
        reject('Screen mesh not found')
      }
    }, undefined, reject)
  })
}
