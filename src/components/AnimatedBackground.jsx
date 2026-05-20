import { Canvas } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { useMemo } from 'react'

export default function AnimatedBackground() {
  const shapes = useMemo(() => {
    const colors = ['#a970d4', '#667eea', '#4facfe', '#f093fb', '#43e97b', '#fa709a', '#fee140']
    const types = ['box', 'sphere', 'torus', 'cone', 'cylinder', 'icosahedron', 'torusKnot', 'octahedron']
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      position: [(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 10 - 3],
      color: colors[i % colors.length],
      shape: types[i % types.length],
      size: 0.3 + Math.random() * 0.5,
      speed: 0.5 + Math.random() * 1.5,
    }))
  }, [])

  return (
    <div className="fixed top-0 left-0 -z-10 w-screen h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        {shapes.map((s) => (
          <Float key={s.id} speed={s.speed} rotationIntensity={0.8} floatIntensity={0.8}>
            <mesh position={s.position} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
              {s.shape === 'box' && <boxGeometry args={[s.size, s.size, s.size]} />}
              {s.shape === 'sphere' && <sphereGeometry args={[s.size * 0.8, 24, 24]} />}
              {s.shape === 'torus' && <torusGeometry args={[s.size * 0.7, s.size * 0.3, 16, 32]} />}
              {s.shape === 'cone' && <coneGeometry args={[s.size * 0.8, s.size * 1.2, 16]} />}
              {s.shape === 'cylinder' && <cylinderGeometry args={[s.size * 0.6, s.size * 0.6, s.size, 16]} />}
              {s.shape === 'icosahedron' && <icosahedronGeometry args={[s.size * 0.8, 0]} />}
              {s.shape === 'torusKnot' && <torusKnotGeometry args={[s.size * 0.6, s.size * 0.2, 40, 8]} />}
              {s.shape === 'octahedron' && <octahedronGeometry args={[s.size * 0.8, 0]} />}
              <meshStandardMaterial color={s.color} wireframe={Math.random() > 0.5} transparent opacity={0.7} />
            </mesh>
          </Float>
        ))}
      </Canvas>
    </div>
  )
}