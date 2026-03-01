"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import * as THREE from "three"

interface Model3DSceneProps {
  modelType: "lathe-chuck" | "circuit-board" | "valve-assembly" | "generic-machine"
  hotspots: Array<{
    position: [number, number, number]
    label: string
    description: string
  }>
  inspectedHotspots: Set<string>
  onHotspotClick: (label: string) => void
}

function LatheChuck() {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2
    }
  })
  return (
    <group ref={groupRef}>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.8, 32]} />
        <meshStandardMaterial color="#1a1a3e" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Jaw slots */}
      {[0, 120, 240].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        return (
          <mesh
            key={i}
            position={[Math.cos(rad) * 0.8, 0.05, Math.sin(rad) * 0.8]}
            rotation={[0, -rad, 0]}
          >
            <boxGeometry args={[0.3, 0.9, 0.15]} />
            <meshStandardMaterial color="#22d3ee" metalness={0.6} roughness={0.4} emissive="#22d3ee" emissiveIntensity={0.15} />
          </mesh>
        )
      })}
      {/* Center bore */}
      <mesh position={[0, 0.41, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.05, 8, 32]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

function CircuitBoard() {
  return (
    <group>
      {/* PCB base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 0.1, 2]} />
        <meshStandardMaterial color="#0a3a0a" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Traces */}
      {[[-0.8, 0.06, -0.5], [0, 0.06, 0.3], [0.8, 0.06, -0.2]].map(
        (pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <boxGeometry args={[0.8, 0.02, 0.05]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.4} />
          </mesh>
        )
      )}
      {/* Components */}
      {[
        { pos: [-0.5, 0.15, -0.3], size: [0.2, 0.2, 0.15] as [number, number, number], color: "#a855f7" },
        { pos: [0.6, 0.12, 0.4], size: [0.3, 0.15, 0.2] as [number, number, number], color: "#ec4899" },
        { pos: [-0.3, 0.1, 0.5], size: [0.15, 0.1, 0.15] as [number, number, number], color: "#f97316" },
        { pos: [0.4, 0.2, -0.4], size: [0.1, 0.3, 0.1] as [number, number, number], color: "#34d399" },
      ].map((comp, i) => (
        <mesh key={i} position={comp.pos as [number, number, number]}>
          <boxGeometry args={comp.size} />
          <meshStandardMaterial color={comp.color} emissive={comp.color} emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  )
}

function ValveAssembly() {
  const handleRef = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (handleRef.current) {
      handleRef.current.rotation.z += delta * 0.3
    }
  })
  return (
    <group>
      {/* Main pipe */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 2.5, 16]} />
        <meshStandardMaterial color="#1a1a3e" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Valve body */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.4, 0.6, 16]} />
        <meshStandardMaterial color="#252552" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Flange rings */}
      {[-1, 1].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.35, 0.05, 8, 32]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.2} />
        </mesh>
      ))}
      {/* Handle */}
      <mesh ref={handleRef} position={[0, 1.1, 0]}>
        <boxGeometry args={[0.8, 0.08, 0.08]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.3} />
      </mesh>
      {/* Handle stem */}
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.3, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

function GenericMachine() {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[2.5, 0.3, 1.5]} />
        <meshStandardMaterial color="#12122a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[2, 1.2, 1.2]} />
        <meshStandardMaterial color="#1a1a3e" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Control panel */}
      <mesh position={[0, 0.5, 0.61]}>
        <boxGeometry args={[1.2, 0.6, 0.02]} />
        <meshStandardMaterial color="#252552" emissive="#a855f7" emissiveIntensity={0.1} />
      </mesh>
      {/* Indicator lights */}
      {[[-0.3, 0.7, 0.62], [0, 0.7, 0.62], [0.3, 0.7, 0.62]].map(
        (pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color={["#34d399", "#f97316", "#ec4899"][i]}
              emissive={["#34d399", "#f97316", "#ec4899"][i]}
              emissiveIntensity={0.5}
            />
          </mesh>
        )
      )}
      {/* Output chute */}
      <mesh position={[1.1, -0.1, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.5, 0.15, 0.6]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.1} />
      </mesh>
    </group>
  )
}

function Hotspot({
  position,
  label,
  inspected,
  onClick,
}: {
  position: [number, number, number]
  label: string
  inspected: boolean
  onClick: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (meshRef.current && !inspected) {
      meshRef.current.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.15)
    }
  })

  return (
    <group position={position}>
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={inspected ? "#34d399" : "#a855f7"}
          emissive={inspected ? "#34d399" : "#a855f7"}
          emissiveIntensity={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Ring around hotspot */}
      <mesh onClick={onClick} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.015, 8, 32]} />
        <meshStandardMaterial
          color={inspected ? "#34d399" : "#a855f7"}
          emissive={inspected ? "#34d399" : "#a855f7"}
          emissiveIntensity={0.4}
          transparent
          opacity={0.6}
        />
      </mesh>
      <Html
        position={[0, 0.2, 0]}
        center
        style={{
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        <div className="text-[9px] px-1.5 py-0.5 rounded bg-space-900/80 text-star-dim border border-space-600">
          {label}
        </div>
      </Html>
    </group>
  )
}

const MODEL_COMPONENTS = {
  "lathe-chuck": LatheChuck,
  "circuit-board": CircuitBoard,
  "valve-assembly": ValveAssembly,
  "generic-machine": GenericMachine,
}

export default function Model3DScene({
  modelType,
  hotspots,
  inspectedHotspots,
  onHotspotClick,
}: Model3DSceneProps) {
  const ModelComponent = MODEL_COMPONENTS[modelType] || GenericMachine

  return (
    <Canvas
      camera={{ position: [3, 2, 3], fov: 45 }}
      style={{ background: "#0a0a1a" }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#e2e8f0" />
      <pointLight position={[-3, 2, -3]} intensity={0.5} color="#a855f7" />
      <pointLight position={[0, -2, 3]} intensity={0.3} color="#22d3ee" />

      <ModelComponent />

      {hotspots.map((hotspot) => (
        <Hotspot
          key={hotspot.label}
          position={hotspot.position}
          label={hotspot.label}
          inspected={inspectedHotspots.has(hotspot.label)}
          onClick={() => onHotspotClick(hotspot.label)}
        />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={8}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  )
}
