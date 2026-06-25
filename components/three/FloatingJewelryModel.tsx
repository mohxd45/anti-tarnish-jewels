"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Float, Image } from "@react-three/drei";

export type ModelType = "ring" | "earring" | "bracelet" | "necklace" | "pearl" | "gem";

export interface FloatingJewelryModelProps {
  type: ModelType;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string; // usually a gold or champagne tone
  speed?: number;
  floatIntensity?: number;
  rotationIntensity?: number;
  imageSrc?: string; // Future feature: use real transparent PNG/WebP instead of procedural 3D
}

// Reusable Luxury Materials
const goldMaterial = new THREE.MeshStandardMaterial({
  color: "#E8C76F", // Champagne gold
  roughness: 0.1,
  metalness: 1.0,
  envMapIntensity: 1.5,
});

const roseGoldMaterial = new THREE.MeshStandardMaterial({
  color: "#E0A9A5", // Rose gold
  roughness: 0.1,
  metalness: 1.0,
  envMapIntensity: 1.5,
});

const diamondMaterial = new THREE.MeshPhysicalMaterial({
  color: "#ffffff",
  roughness: 0,
  metalness: 0.2,
  transmission: 0.95, // Highly transparent glass-like
  ior: 2.4, // diamond refractive index
  thickness: 0.5,
  envMapIntensity: 2.0,
  clearcoat: 1.0,
});

const pearlMaterial = new THREE.MeshPhysicalMaterial({
  color: "#FFFDFB",
  roughness: 0.15,
  metalness: 0.1,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  ior: 1.5,
  transmission: 0,
});

const blushGemMaterial = new THREE.MeshPhysicalMaterial({
  color: "#F7DADA", // Blush pink gem
  roughness: 0,
  metalness: 0.2,
  transmission: 0.85,
  ior: 2.0,
  thickness: 0.5,
  envMapIntensity: 1.5,
  clearcoat: 1.0,
});

export function FloatingJewelryModel({
  type,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  color,
  speed = 1,
  floatIntensity = 1,
  rotationIntensity = 1,
  imageSrc,
}: FloatingJewelryModelProps) {
  const groupRef = useRef<THREE.Group>(null!);

  // Very slow, elegant idle rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += delta * 0.05 * speed;
      groupRef.current.rotation.y += delta * 0.075 * speed;
    }
  });

  // Determine base metal material based on color
  let baseMetal = goldMaterial;
  if (color && color.toLowerCase().includes("rose")) baseMetal = roseGoldMaterial;
  else if (color && color.toLowerCase().includes("champagne")) baseMetal = goldMaterial;
  else if (color) {
    baseMetal = goldMaterial.clone();
    baseMetal.color.set(color);
  }

  // Geometries
  const ringGeom = useMemo(() => new THREE.TorusGeometry(0.8, 0.15, 32, 64), []);
  const earringHoopGeom = useMemo(() => new THREE.TorusGeometry(0.5, 0.08, 32, 64), []);
  const braceletGeom = useMemo(() => new THREE.TorusGeometry(1.2, 0.25, 32, 64), []);
  const gemGeom = useMemo(() => new THREE.OctahedronGeometry(0.3, 0), []);
  const pearlGeom = useMemo(() => new THREE.SphereGeometry(0.3, 32, 32), []);
  const tinyBeadGeom = useMemo(() => new THREE.SphereGeometry(0.08, 16, 16), []);
  
  // Create necklace arc beads
  const necklaceBeads = useMemo(() => {
    const beads = [];
    const curve = new THREE.EllipseCurve(0, 0, 1.5, 1.2, 0, Math.PI, false, 0);
    const points = curve.getPoints(40);
    for (let i = 0; i < points.length; i++) {
      beads.push(new THREE.Vector3(points[i].x, -points[i].y, 0)); // Flip Y to hang like a necklace
    }
    return beads;
  }, []);

  // Future feature: Render Image if provided
  if (imageSrc) {
    return (
      <Float speed={1 * speed} rotationIntensity={rotationIntensity} floatIntensity={floatIntensity} floatingRange={[-0.1, 0.1]}>
        <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
          {/* Fallback to render future 2D assets in 3D space */}
          <Image url={imageSrc} transparent scale={[2, 2]} />
        </group>
      </Float>
    );
  }

  const renderContent = () => {
    switch (type) {
      case "ring":
        return (
          <>
            <mesh geometry={ringGeom} material={baseMetal} />
            {/* Gem on top */}
            <mesh geometry={gemGeom} material={diamondMaterial} position={[0, 0.9, 0]} />
            {/* Prongs (tiny boxes) */}
            <mesh position={[0.15, 0.8, 0]} material={baseMetal}>
              <boxGeometry args={[0.05, 0.25, 0.05]} />
            </mesh>
            <mesh position={[-0.15, 0.8, 0]} material={baseMetal}>
              <boxGeometry args={[0.05, 0.25, 0.05]} />
            </mesh>
          </>
        );
      case "earring":
        return (
          <>
            {/* Small hoop */}
            <mesh geometry={earringHoopGeom} material={baseMetal} position={[0, 0.5, 0]} />
            {/* Tiny connector link */}
            <mesh material={baseMetal} position={[0, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.3]} />
            </mesh>
            {/* Hanging Pearl */}
            <mesh geometry={pearlGeom} material={pearlMaterial} position={[0, -0.3, 0]} scale={[0.8, 0.8, 0.8]} />
          </>
        );
      case "bracelet":
        return (
          <group scale={[1, 0.7, 1]}> {/* Flatten slightly for bangle look */}
            <mesh geometry={braceletGeom} material={baseMetal} />
            {/* Add some gem accents around the bracelet band */}
            <mesh geometry={gemGeom} material={blushGemMaterial} position={[1.4, 0, 0]} scale={[0.4, 0.4, 0.4]} />
            <mesh geometry={gemGeom} material={blushGemMaterial} position={[-1.4, 0, 0]} scale={[0.4, 0.4, 0.4]} />
            <mesh geometry={gemGeom} material={blushGemMaterial} position={[0, 0, 1.4]} scale={[0.4, 0.4, 0.4]} />
            <mesh geometry={gemGeom} material={blushGemMaterial} position={[0, 0, -1.4]} scale={[0.4, 0.4, 0.4]} />
          </group>
        );
      case "necklace":
        return (
          <>
            {/* Beads forming chain */}
            {necklaceBeads.map((pos, i) => (
              <mesh key={i} geometry={tinyBeadGeom} material={baseMetal} position={pos} />
            ))}
            {/* Pendant drop at bottom center */}
            <mesh geometry={gemGeom} material={diamondMaterial} position={[0, -1.3, 0]} scale={[1.2, 1.2, 1.2]} />
            <mesh geometry={pearlGeom} material={pearlMaterial} position={[0, -1.7, 0]} scale={[0.7, 0.7, 0.7]} />
          </>
        );
      case "pearl":
        return (
          <mesh material={pearlMaterial}>
            <sphereGeometry args={[1, 64, 64]} />
          </mesh>
        );
      case "gem":
        return (
          <mesh material={Math.random() > 0.5 ? diamondMaterial : blushGemMaterial}>
            <octahedronGeometry args={[1, 0]} />
          </mesh>
        );
      default:
        return null;
    }
  };

  return (
    <Float
      speed={1 * speed} 
      rotationIntensity={rotationIntensity * 0.5} 
      floatIntensity={floatIntensity * 0.5}
      floatingRange={[-0.1, 0.1]}
    >
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
        scale={scale}
      >
        {renderContent()}
      </group>
    </Float>
  );
}
