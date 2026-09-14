import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import earthTextureUrl from '@/assets/earth_atmos_1024.jpg'
import earthCloudsUrl from '@/assets/earth_clouds_1024.png'
import earthSpecularUrl from '@/assets/earth_specular_1024.jpg'

interface FinancialGlobeProps {
  reducedMotion?: boolean
  className?: string
}

// Financial Hubs & Intelligence Nodes (Deterministic Mock Coordinates)
interface NetworkNode {
  id: string
  name: string
  lat: number
  lon: number
  type: 'normal' | 'important' | 'risk'
}

interface NetworkArc {
  from: string
  to: string
  type: 'normal' | 'important' | 'risk'
  speed: number
  offset: number
}

const NODES: NetworkNode[] = [
  // Primary Institutional Hubs (Gold)
  { id: 'nyc', name: 'New York (Institutional)', lat: 40.7128, lon: -74.006, type: 'important' },
  { id: 'lon', name: 'London (Treasury)', lat: 51.5074, lon: -0.1278, type: 'important' },
  { id: 'zur', name: 'Zurich (Private Banking)', lat: 47.3769, lon: 8.5417, type: 'important' },
  { id: 'tok', name: 'Tokyo (Exchange)', lat: 35.6762, lon: 139.6503, type: 'important' },
  { id: 'sin', name: 'Singapore (Clearing)', lat: 1.3521, lon: 103.8198, type: 'important' },

  // Global Financial Nodes (Green)
  { id: 'fra', name: 'Frankfurt', lat: 50.1109, lon: 8.6821, type: 'normal' },
  { id: 'ams', name: 'Amsterdam', lat: 52.3676, lon: 4.9041, type: 'normal' },
  { id: 'par', name: 'Paris', lat: 48.8566, lon: 2.3522, type: 'normal' },
  { id: 'tor', name: 'Toronto', lat: 43.6532, lon: -79.3832, type: 'normal' },
  { id: 'sfo', name: 'San Francisco', lat: 37.7749, lon: -122.4194, type: 'normal' },
  { id: 'chi', name: 'Chicago', lat: 41.8781, lon: -87.6298, type: 'normal' },
  { id: 'hkg', name: 'Hong Kong', lat: 22.3193, lon: 114.1694, type: 'normal' },
  { id: 'dxb', name: 'Dubai', lat: 25.2048, lon: 55.2708, type: 'normal' },
  { id: 'bom', name: 'Mumbai', lat: 19.076, lon: 72.8777, type: 'normal' },
  { id: 'syd', name: 'Sydney', lat: -33.8688, lon: 151.2093, type: 'normal' },
  { id: 'sao', name: 'São Paulo', lat: -23.5505, lon: -46.6333, type: 'normal' },
  { id: 'jnb', name: 'Johannesburg', lat: -26.2041, lon: 28.0473, type: 'normal' },
  { id: 'icn', name: 'Seoul', lat: 37.5665, lon: 126.978, type: 'normal' },
  { id: 'nbo', name: 'Nairobi', lat: -1.2921, lon: 36.8219, type: 'normal' },

  // Elevated Risk & Suspicious Transaction Signals (Red / Amber-Red)
  { id: 'rsk1', name: 'Offshore Inflow Spike', lat: 12.1696, lon: -68.99, type: 'risk' },
  { id: 'rsk2', name: 'Rapid Structuring Signal', lat: 35.8617, lon: 14.3754, type: 'risk' },
  { id: 'rsk3', name: 'High-Velocity Transit', lat: 7.8731, lon: 80.7718, type: 'risk' }
]

const ARCS: NetworkArc[] = [
  // Major High-Value Settlement Corridors (Gold)
  { from: 'nyc', to: 'lon', type: 'important', speed: 0.35, offset: 0.1 },
  { from: 'lon', to: 'zur', type: 'important', speed: 0.4, offset: 0.4 },
  { from: 'sin', to: 'tok', type: 'important', speed: 0.32, offset: 0.2 },
  { from: 'nyc', to: 'tok', type: 'important', speed: 0.28, offset: 0.7 },

  // Global Liquidity Flows (Green)
  { from: 'nyc', to: 'sfo', type: 'normal', speed: 0.3, offset: 0.15 },
  { from: 'nyc', to: 'chi', type: 'normal', speed: 0.38, offset: 0.5 },
  { from: 'tor', to: 'nyc', type: 'normal', speed: 0.33, offset: 0.3 },
  { from: 'lon', to: 'fra', type: 'normal', speed: 0.42, offset: 0.6 },
  { from: 'fra', to: 'ams', type: 'normal', speed: 0.45, offset: 0.2 },
  { from: 'par', to: 'lon', type: 'normal', speed: 0.4, offset: 0.8 },
  { from: 'dxb', to: 'lon', type: 'normal', speed: 0.3, offset: 0.45 },
  { from: 'hkg', to: 'sin', type: 'normal', speed: 0.35, offset: 0.25 },
  { from: 'sin', to: 'syd', type: 'normal', speed: 0.29, offset: 0.65 },
  { from: 'bom', to: 'dxb', type: 'normal', speed: 0.34, offset: 0.1 },
  { from: 'sao', to: 'nyc', type: 'normal', speed: 0.26, offset: 0.55 },
  { from: 'icn', to: 'tok', type: 'normal', speed: 0.42, offset: 0.75 },

  // Flagged Risk Corridors (Red)
  { from: 'rsk1', to: 'nyc', type: 'risk', speed: 0.25, offset: 0.35 },
  { from: 'rsk2', to: 'lon', type: 'risk', speed: 0.28, offset: 0.7 },
  { from: 'rsk3', to: 'sin', type: 'risk', speed: 0.24, offset: 0.05 }
]

// Colors aligned with FinShield Brand & Earth Visualization System
const COLOR_MAP = {
  navy: 0x0b1f3a,
  darkBase: 0x061120,
  growthGreen: 0x00d98b,
  insightGold: 0xf59e0b,
  riskRed: 0xef4444,
  cyanScan: 0x0ea5e9,
  atmosphereBlue: 0x38bdf8,
  oceanSpecular: 0x38bdf8,
  subtleGrid: 0x1e3a5f
}

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new THREE.Vector3(x, y, z)
}

export const FinancialGlobe: React.FC<FinancialGlobeProps> = ({
  reducedMotion = false,
  className = ''
}) => {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // Scene Setup
    const scene = new THREE.Scene()

    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000)
    camera.position.set(0, 0, 4.0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.24
    container.appendChild(renderer.domElement)

    // Texture Loader (Bundled local public-domain NASA Earth textures)
    const textureLoader = new THREE.TextureLoader()

    const earthTexture = textureLoader.load(earthTextureUrl, () => {
      renderer.render(scene, camera)
    })
    earthTexture.colorSpace = THREE.SRGBColorSpace

    const cloudsTexture = textureLoader.load(earthCloudsUrl, () => {
      renderer.render(scene, camera)
    })

    const specularTexture = textureLoader.load(earthSpecularUrl, () => {
      renderer.render(scene, camera)
    })

    // Main Globe Group (Initial Orientation: Directly Facing India)
    // India Center: Lat ≈ 20.6° N, Lon ≈ 78.9° E
    // With phi=(90-lat) and theta=(lon+180), rotation around Y = 3.3353 rad (191.10°) aligns India directly to camera (+Z)
    const INITIAL_INDIA_Y = 3.3353
    const INITIAL_INDIA_X = 0.18 // slight pitch to place Indian subcontinent in clear view
    const globeGroup = new THREE.Group()
    globeGroup.rotation.set(INITIAL_INDIA_X, INITIAL_INDIA_Y, 0)

    let baseGlobeScale = 1.08

    const updateGlobeYPosition = () => {
      const isMobile = window.innerWidth < 768
      globeGroup.position.y = isMobile ? -0.72 : -0.62
      baseGlobeScale = isMobile ? 0.88 : 1.08
      globeGroup.scale.setScalar(baseGlobeScale)
    }
    updateGlobeYPosition()
    scene.add(globeGroup)

    const GLOBE_RADIUS = 1.35

    // 1. Realistic 3D Earth Surface (Natural blue oceans, green/brown continents, restrained specular sheen)
    const earthGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 48)
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      specularMap: specularTexture,
      specular: new THREE.Color(0x1e40af),
      shininess: 16,
      color: new THREE.Color(0xffffff),
      emissive: new THREE.Color(0x040d1a),
      emissiveIntensity: 0.10
    })
    const earthSphere = new THREE.Mesh(earthGeometry, earthMaterial)
    globeGroup.add(earthSphere)

    // 2. Realistic Cloud Layer (Soft, semi-transparent natural clouds)
    const cloudGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.008, 48, 36)
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.28,
      blending: THREE.NormalBlending,
      depthWrite: false
    })
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial)
    globeGroup.add(cloudMesh)

    // 3. Subtle Technical Wireframe & Coordinate Grid (Kept very faint so continents dominate)
    const wireGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.002, 32, 24)
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: COLOR_MAP.subtleGrid,
      wireframe: true,
      transparent: true,
      opacity: 0.025
    })
    const globeWire = new THREE.Mesh(wireGeometry, wireMaterial)
    globeGroup.add(globeWire)

    // Subtle coordinate rings (Equator & Tropics)
    const createLatRing = (latDeg: number, opacity: number, colorHex: number) => {
      const latRad = (latDeg * Math.PI) / 180
      const ringRadius = GLOBE_RADIUS * 1.004 * Math.cos(latRad)
      const ringY = GLOBE_RADIUS * 1.004 * Math.sin(latRad)

      const ringCurve = new THREE.EllipseCurve(0, 0, ringRadius, ringRadius, 0, 2 * Math.PI, false, 0)
      const points = ringCurve.getPoints(64)
      const ringGeo = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, ringY, p.y))
      )
      const ringMat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity
      })
      return new THREE.Line(ringGeo, ringMat)
    }

    globeGroup.add(createLatRing(0, 0.10, COLOR_MAP.atmosphereBlue)) // Equator
    globeGroup.add(createLatRing(23.5, 0.04, COLOR_MAP.subtleGrid)) // Tropic of Cancer
    globeGroup.add(createLatRing(-23.5, 0.04, COLOR_MAP.subtleGrid)) // Tropic of Capricorn
    globeGroup.add(createLatRing(50.0, 0.04, COLOR_MAP.subtleGrid)) // Northern Hub Parallel

    // 4. Subtle Geospatial Coordinate Points (Sparsely placed for intelligence texture)
    const pointCount = 120
    const dotPositions = new Float32Array(pointCount * 3)
    const dotColors = new Float32Array(pointCount * 3)
    const phiWeight = Math.PI * (3 - Math.sqrt(5))

    const cyanColor = new THREE.Color(COLOR_MAP.cyanScan)
    const gridColor = new THREE.Color(COLOR_MAP.subtleGrid)

    for (let i = 0; i < pointCount; i++) {
      const y = 1 - (i / (pointCount - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = phiWeight * i

      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY

      const r = GLOBE_RADIUS * 1.006
      dotPositions[i * 3] = x * r
      dotPositions[i * 3 + 1] = y * r
      dotPositions[i * 3 + 2] = z * r

      const isBrighter = i % 5 === 0
      const c = isBrighter ? cyanColor : gridColor
      dotColors[i * 3] = c.r
      dotColors[i * 3 + 1] = c.g
      dotColors[i * 3 + 2] = c.b
    }

    const dotGeometry = new THREE.BufferGeometry()
    dotGeometry.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3))
    dotGeometry.setAttribute('color', new THREE.BufferAttribute(dotColors, 3))

    const dotMaterial = new THREE.PointsMaterial({
      size: 0.018,
      vertexColors: true,
      transparent: true,
      opacity: 0.14
    })
    const dotPoints = new THREE.Points(dotGeometry, dotMaterial)
    globeGroup.add(dotPoints)

    // 5. Thin Blue Atmospheric Fresnel Glow Shell
    const atmosphereVertexShader = `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `
    const atmosphereFragmentShader = `
      varying vec3 vNormal;
      uniform vec3 glowColor;
      uniform float opacityFactor;
      void main() {
        float intensity = pow(0.70 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
        gl_FragColor = vec4(glowColor, 1.0) * intensity * opacityFactor;
      }
    `
    const atmosphereUniforms = {
      glowColor: { value: new THREE.Color(COLOR_MAP.atmosphereBlue) },
      opacityFactor: { value: 0.60 }
    }
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: atmosphereUniforms,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    })
    const atmosphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.12, 36, 36)
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMaterial)
    globeGroup.add(atmosphereMesh)

    // 6. Financial Intelligence Nodes (Anchored to geographic coordinates)
    interface NodeMeshGroup {
      node: NetworkNode
      mesh: THREE.Mesh
      pulseRing: THREE.Mesh
      beaconLine?: THREE.Line
    }

    const nodeMeshes: NodeMeshGroup[] = []
    const nodeCoordsMap: Record<string, THREE.Vector3> = {}

    NODES.forEach(node => {
      const pos = latLonToVector3(node.lat, node.lon, GLOBE_RADIUS * 1.014)
      nodeCoordsMap[node.id] = pos

      const nodeGroup = new THREE.Group()
      nodeGroup.position.copy(pos)
      nodeGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize())

      let colorHex = COLOR_MAP.growthGreen
      let coreSize = 0.024
      if (node.type === 'important') {
        colorHex = COLOR_MAP.insightGold
        coreSize = 0.032
      } else if (node.type === 'risk') {
        colorHex = COLOR_MAP.riskRed
        coreSize = 0.036
      }

      // Core sphere
      const coreGeo = new THREE.SphereGeometry(coreSize, 16, 16)
      const coreMat = new THREE.MeshBasicMaterial({ color: colorHex })
      const coreMesh = new THREE.Mesh(coreGeo, coreMat)
      nodeGroup.add(coreMesh)

      // Tangent pulsing ring
      const ringGeo = new THREE.RingGeometry(coreSize * 1.3, coreSize * 1.9, 24)
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.82,
        side: THREE.DoubleSide
      })
      const ringMesh = new THREE.Mesh(ringGeo, ringMat)
      nodeGroup.add(ringMesh)

      // Vertical intelligence beacon for high-value and risk nodes
      let beaconLine: THREE.Line | undefined
      if (node.type === 'important' || node.type === 'risk') {
        const beaconHeight = node.type === 'risk' ? 0.16 : 0.12
        const beaconGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, beaconHeight)
        ])
        const beaconMat = new THREE.LineBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.9
        })
        beaconLine = new THREE.Line(beaconGeo, beaconMat)
        nodeGroup.add(beaconLine)
      }

      globeGroup.add(nodeGroup)
      nodeMeshes.push({
        node,
        mesh: coreMesh,
        pulseRing: ringMesh,
        beaconLine
      })
    })

    // 7. Transaction Arcs & Flowing Signal Packets
    interface ArcRenderGroup {
      arc: NetworkArc
      curve: THREE.QuadraticBezierCurve3
      line: THREE.Line
      packetMesh: THREE.Mesh
      progress: number
    }

    const arcRenderGroups: ArcRenderGroup[] = []

    ARCS.forEach(arc => {
      const p1 = nodeCoordsMap[arc.from]
      const p2 = nodeCoordsMap[arc.to]
      if (!p1 || !p2) return

      const dist = p1.distanceTo(p2)
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)
      const elevation = GLOBE_RADIUS + Math.min(0.5, dist * 0.32)
      mid.normalize().multiplyScalar(elevation)

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2)
      const curvePoints = curve.getPoints(42)
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints)

      let arcColor = COLOR_MAP.growthGreen
      let arcOpacity = 0.44
      if (arc.type === 'important') {
        arcColor = COLOR_MAP.insightGold
        arcOpacity = 0.65
      } else if (arc.type === 'risk') {
        arcColor = COLOR_MAP.riskRed
        arcOpacity = 0.8
      }

      const curveMat = new THREE.LineBasicMaterial({
        color: arcColor,
        transparent: true,
        opacity: arcOpacity
      })
      const curveLine = new THREE.Line(curveGeo, curveMat)
      globeGroup.add(curveLine)

      // Traveling signal packet
      const packetGeo = new THREE.SphereGeometry(arc.type === 'risk' ? 0.026 : 0.02, 12, 12)
      const packetMat = new THREE.MeshBasicMaterial({ color: arcColor })
      const packetMesh = new THREE.Mesh(packetGeo, packetMat)
      packetMesh.position.copy(p1)
      globeGroup.add(packetMesh)

      arcRenderGroups.push({
        arc,
        curve,
        line: curveLine,
        packetMesh,
        progress: arc.offset
      })
    })

    // 8. Scanning Ring Sweep
    const scanRingGeo = new THREE.RingGeometry(GLOBE_RADIUS * 1.014, GLOBE_RADIUS * 1.026, 64)
    const scanRingMat = new THREE.MeshBasicMaterial({
      color: COLOR_MAP.cyanScan,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide
    })
    const scanRingMesh = new THREE.Mesh(scanRingGeo, scanRingMat)
    scanRingMesh.rotation.x = Math.PI / 3
    scanRingMesh.rotation.y = Math.PI / 6
    globeGroup.add(scanRingMesh)

    // 9. Sparse Ambient Floating Particles Field
    const particleCount = 60
    const particleGeo = new THREE.BufferGeometry()
    const particlePos = new Float32Array(particleCount * 3)
    const particleCols = new Float32Array(particleCount * 3)

    const goldColor = new THREE.Color(COLOR_MAP.insightGold)
    const slateColor = new THREE.Color(0x94a3b8)

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random()
      const v = Math.random()
      const theta = u * 2.0 * Math.PI
      const phi = Math.acos(2.0 * v - 1.0)
      const r = GLOBE_RADIUS * (1.2 + Math.random() * 0.75)

      const sinPhi = Math.sin(phi)
      particlePos[i * 3] = r * sinPhi * Math.cos(theta)
      particlePos[i * 3 + 1] = r * sinPhi * Math.sin(theta)
      particlePos[i * 3 + 2] = r * Math.cos(phi)

      const c = i % 6 === 0 ? goldColor : i % 3 === 0 ? cyanColor : slateColor
      particleCols[i * 3] = c.r
      particleCols[i * 3 + 1] = c.g
      particleCols[i * 3 + 2] = c.b
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleCols, 3))

    const particleMat = new THREE.PointsMaterial({
      size: 0.024,
      vertexColors: true,
      transparent: true,
      opacity: 0.35
    })
    const particleField = new THREE.Points(particleGeo, particleMat)
    globeGroup.add(particleField)

    // 10. Realistic Space Lighting (Sunlight + Natural Fill + Subtle Depth)
    // Primary Key Sunlight (Balanced, natural daylight from upper-right-front onto India & visible continents)
    const sunLight = new THREE.DirectionalLight(0xfffbf5, 2.2)
    sunLight.position.set(2.8, 2.2, 3.8)
    scene.add(sunLight)

    // Natural Hemisphere Fill (Sky daylight fill on top, deep oceanic navy on shadow side)
    const hemiLight = new THREE.HemisphereLight(0x6ba6e8, 0x06152b, 0.75)
    scene.add(hemiLight)

    // Soft Daylight Side-Fill (Softens terminator shadows so continents remain readable without excessive glow)
    const fillLight = new THREE.DirectionalLight(0x88b7ec, 0.45)
    fillLight.position.set(-2.4, 1.6, 3.2)
    scene.add(fillLight)

    // Thin Atmospheric Blue Rim Light (Restrained limb glow)
    const rimLight = new THREE.DirectionalLight(COLOR_MAP.atmosphereBlue, 0.65)
    rimLight.position.set(-4.0, -0.6, -2.0)
    scene.add(rimLight)

    // Subtle Institutional Accent Fill
    const goldAccent = new THREE.DirectionalLight(COLOR_MAP.insightGold, 0.25)
    goldAccent.position.set(0, -3.5, 2.0)
    scene.add(goldAccent)

    // Interaction & Parallax Handlers
    let targetPitchX = INITIAL_INDIA_X
    let mouseX = 0
    let mouseY = 0

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (reducedMotion) return
      let clientX = 0
      let clientY = 0

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else if ('clientX' in e) {
        clientX = e.clientX
        clientY = e.clientY
      }

      mouseX = (clientX / window.innerWidth - 0.5) * 2
      mouseY = (clientY / window.innerHeight - 0.5) * 2

      targetPitchX = INITIAL_INDIA_X + mouseY * 0.10
    }

    window.addEventListener('mousemove', handlePointerMove, { passive: true })
    window.addEventListener('touchmove', handlePointerMove, { passive: true })

    // Resize Handler
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth || window.innerWidth
      const h = container.clientHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      updateGlobeYPosition()
    }
    window.addEventListener('resize', handleResize)

    // Animation Loop
    let animationFrameId: number
    const clock = new THREE.Clock()
    const startTime = performance.now()

    // Smooth India-centered continuous rotation tracker
    let currentRotationY = INITIAL_INDIA_Y
    let mouseParallaxY = 0
    let currentPitchX = INITIAL_INDIA_X

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const elapsed = (performance.now() - startTime) / 1000
      const delta = clock.getDelta()

      // Phase In Timing:
      // 0.0 - 0.8s: Globe scales in from 0.82 to 1 with India directly facing the camera
      // 0.8 - 1.8s: Atmosphere glow becomes visible
      // 1.5 - 2.5s: Nodes activate (Mumbai node pulsing on India, Singapore, Dubai)
      // 2.0 - 3.5s: Transaction arcs flow
      // ~2.8s onward: Globe begins slow, smooth continuous rotation
      let introScale = 1
      let introAlpha = 1
      if (!reducedMotion) {
        if (elapsed < 0.9) {
          const t = Math.min(elapsed / 0.9, 1)
          introScale = 0.82 + 0.18 * Math.sin((t * Math.PI) / 2)
          introAlpha = t
        }
      }
      globeGroup.scale.setScalar(baseGlobeScale * introScale)

      // India-First Rotation Sequence:
      // Earth starts facing India, then smoothly accelerates into a faster, dynamic cinematic rotation
      const frameFactor = Math.min(delta * 60, 2.0)
      if (!reducedMotion && elapsed > 0.4) {
        const ramp = Math.min(1, (elapsed - 0.4) / 0.8)
        const ease = ramp * ramp * (3 - 2 * ramp) // Smooth Hermite S-curve
        const speed = 0.016 * ease * frameFactor // Dynamic, visibly fast planetary rotation
        currentRotationY += speed
      } else if (reducedMotion && elapsed > 0.8) {
        currentRotationY += 0.0016 * frameFactor
      }

      // Parallax Interpolation (Restrained and smooth)
      currentPitchX += (targetPitchX - currentPitchX) * 0.04
      mouseParallaxY += (mouseX * 0.14 - mouseParallaxY) * 0.04

      globeGroup.rotation.x = currentPitchX
      globeGroup.rotation.y = currentRotationY + mouseParallaxY
      globeGroup.rotation.z += ((-mouseX * 0.06) - globeGroup.rotation.z) * 0.04

      // Cloud Drift (slightly faster than planet for realistic depth)
      cloudMesh.rotation.y += 0.0006

      // Atmosphere Uniforms
      atmosphereUniforms.opacityFactor.value = introAlpha * (reducedMotion ? 0.45 : 0.60 + Math.sin(elapsed * 1.5) * 0.04)

      // Scanning Ring Rotation
      scanRingMesh.rotation.z += 0.004
      scanRingMesh.rotation.y += 0.0025

      // Particle Field Gentle Drift
      particleField.rotation.y += 0.0004
      particleField.rotation.x += 0.0003

      // Pulsing Nodes Animation
      const pulsePhase = elapsed * 3.2
      nodeMeshes.forEach((item, index) => {
        const offset = index * 0.4
        const pulse = (Math.sin(pulsePhase + offset) + 1) * 0.5
        const scaleVal = 1 + pulse * 0.55
        item.pulseRing.scale.set(scaleVal, scaleVal, 1)

        const ringMat = item.pulseRing.material as THREE.MeshBasicMaterial
        ringMat.opacity = Math.max(0.1, 0.85 - pulse * 0.6)

        // Subtle node activation during intro
        if (!reducedMotion && elapsed < 2.0) {
          const activation = Math.max(0, Math.min(1, (elapsed - 1.2 - index * 0.03) / 0.6))
          item.mesh.scale.setScalar(activation)
        }
      })

      // Transaction Arc Traveling Packets
      const arcActive = reducedMotion || elapsed > 1.8
      arcRenderGroups.forEach(item => {
        if (!arcActive) {
          item.packetMesh.visible = false
          return
        }

        item.packetMesh.visible = true
        item.progress = (item.progress + delta * (reducedMotion ? 0.1 : item.arc.speed)) % 1
        const currentPos = item.curve.getPoint(item.progress)
        item.packetMesh.position.copy(currentPos)

        const pulse = Math.sin(item.progress * Math.PI)
        item.packetMesh.scale.setScalar(0.8 + pulse * 0.7)
      })

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup Resources
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('resize', handleResize)

      // Dispose textures
      earthTexture.dispose()
      cloudsTexture.dispose()
      specularTexture.dispose()

      // Traverse and dispose geometries and materials
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
          if (obj.geometry) obj.geometry.dispose()
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(m => m.dispose())
            } else {
              obj.material.dispose()
            }
          }
        }
      })

      renderer.dispose()
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
    }
  }, [reducedMotion])

  return (
    <div
      ref={mountRef}
      className={`w-full h-full relative pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    />
  )
}
