import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Float } from '@react-three/drei'
import { useMemo } from 'react'

function FloatingShape({ position, color, shape, size, speed }) {
  const mesh = useMemo(() => {
    switch (shape) {
      case 'box':
        return <boxGeometry args={[size, size, size]} />
      case 'sphere':
        return <sphereGeometry args={[size * 0.8, 24, 24]} />
      case 'torus':
        return <torusGeometry args={[size * 0.7, size * 0.3, 16, 32]} />
      case 'cone':
        return <coneGeometry args={[size * 0.8, size * 1.2, 16]} />
      case 'cylinder':
        return <cylinderGeometry args={[size * 0.6, size * 0.6, size, 16]} />
      case 'icosahedron':
        return <icosahedronGeometry args={[size * 0.8, 0]} />
      case 'torusKnot':
        return <torusKnotGeometry args={[size * 0.6, size * 0.2, 40, 8]} />
      case 'octahedron':
        return <octahedronGeometry args={[size * 0.8, 0]} />
      default:
        return <sphereGeometry args={[size * 0.8, 24, 24]} />
    }
  }, [shape, size])

  return (
    <Float speed={speed} rotationIntensity={0.8} floatIntensity={0.8}>
      <mesh position={position} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
        {mesh}
        <meshStandardMaterial
          color={color}
          wireframe={Math.random() > 0.5}
          transparent
          opacity={0.7}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>
    </Float>
  )
}

export default function AnimatedBackground() {
  const shapes = useMemo(() => {
    const shapeTypes = ['box', 'sphere', 'torus', 'cone', 'cylinder', 'icosahedron', 'torusKnot', 'octahedron']
    const colors = [
      '#a970d4', '#667eea', '#4facfe', '#00f2fe', '#f093fb',
      '#f5576c', '#4facfe', '#43e97b', '#fa709a', '#fee140',
    ]

    const generated = []
    const count = 25

    for (let i = 0; i < count; i++) {
      generated.push({
        id: i,
        position: [
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 10 - 3,
        ],
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        size: 0.3 + Math.random() * 0.5,
        speed: 0.5 + Math.random() * 1.5,
      })
    }
    return generated
  }, [])

  return (
    <div className="fixed top-0 left-0 -z-10 w-screen h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -5, -5]} intensity={0.5} color="#667eea" />
        <pointLight position={[5, -5, 10]} intensity={0.6} color="#f093fb" />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.15}
          enableDamping
          dampingFactor={0.05}
        />

        {shapes.map((shape) => (
          <FloatingShape key={shape.id} {...shape} />
        ))}

        <Environment preset="night" />
      </Canvas>
    </div>
  )
}