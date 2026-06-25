"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { FloatingJewelryModel } from "./FloatingJewelryModel";
import { Environment, Lightformer } from "@react-three/drei";

interface LuxuryJewelrySceneProps {
  interactiveParallax?: boolean;
  itemCount?: "light" | "medium" | "heavy";
}

export function LuxuryJewelryScene({ interactiveParallax = true, itemCount = "medium" }: LuxuryJewelrySceneProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const mouse = useRef({ x: 0, y: 0 });

  // Handle mouse parallax
  useFrame((state) => {
    if (interactiveParallax && groupRef.current) {
      // Lerp group rotation towards mouse position for a soft parallax effect
      // state.mouse is normalized (-1 to 1)
      mouse.current.x = THREE.MathUtils.lerp(mouse.current.x, state.mouse.x * 0.5, 0.05);
      mouse.current.y = THREE.MathUtils.lerp(mouse.current.y, state.mouse.y * 0.5, 0.05);
      
      groupRef.current.rotation.y = mouse.current.x;
      groupRef.current.rotation.x = -mouse.current.y;
    }
    
    // Slow continuous rotation of the entire group for ambient life
    if (groupRef.current) {
       groupRef.current.rotation.y += 0.001;
    }
  });

  // Decide how many items based on requested weight
  const config = {
    light: { rings: 1, earrings: 1, bracelets: 1, necklaces: 1, pearls: 2, gems: 2 },
    medium: { rings: 2, earrings: 2, bracelets: 2, necklaces: 1, pearls: 4, gems: 3 },
    heavy: { rings: 3, earrings: 3, bracelets: 2, necklaces: 2, pearls: 6, gems: 5 },
  }[itemCount];

  return (
    <>
      <color attach="background" args={["transparent"]} />
      
      {/* Luxury Lighting Setup */}
      <ambientLight intensity={0.4} color="#fff1e6" />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffd1a9" castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[-5, 5, 5]} angle={0.5} penumbra={1} intensity={2} color="#ffb6c1" />
      <Environment preset="city" environmentIntensity={0.5}>
        <Lightformer form="rect" intensity={2} position={[0, 5, -10]} scale={[10, 5, 1]} target={[0, 0, 0]} />
      </Environment>

      <group ref={groupRef}>
        {/* We statically position these to look like a scattered cluster in 3D space */}
        {/* RINGS */}
        {config.rings > 0 && <FloatingJewelryModel type="ring" position={[-3, 2, -2]} scale={0.4} speed={0.8} color="#D4AF37" />}
        {config.rings > 1 && <FloatingJewelryModel type="ring" position={[3.5, -1.5, 1]} scale={0.3} speed={1.2} color="#E5D3B3" />}
        {config.rings > 2 && <FloatingJewelryModel type="ring" position={[2, 3, -4]} scale={0.45} speed={0.6} color="#E0A9A5" rotationIntensity={2} />}

        {/* EARRINGS */}
        {config.earrings > 0 && <FloatingJewelryModel type="earring" position={[1.5, -2.5, -2]} scale={0.4} speed={1.5} color="#D4AF37" />}
        {config.earrings > 1 && <FloatingJewelryModel type="earring" position={[-2, -2, 3]} scale={0.35} speed={1.2} color="#E0A9A5" floatIntensity={1.5} />}
        {config.earrings > 2 && <FloatingJewelryModel type="earring" position={[-4, 1.5, 1]} scale={0.3} speed={1.8} color="#E5D3B3" />}

        {/* BRACELETS */}
        {config.bracelets > 0 && <FloatingJewelryModel type="bracelet" position={[-2, 1, 2]} scale={0.5} speed={0.7} color="#E0A9A5" />}
        {config.bracelets > 1 && <FloatingJewelryModel type="bracelet" position={[3, 1, -2]} scale={0.4} speed={0.9} color="#D4AF37" floatIntensity={1.2} />}

        {/* NECKLACES */}
        {config.necklaces > 0 && <FloatingJewelryModel type="necklace" position={[0, 2.5, -1]} scale={0.6} speed={0.5} color="#E5D3B3" />}
        {config.necklaces > 1 && <FloatingJewelryModel type="necklace" position={[-3.5, -3, 0]} scale={0.5} speed={0.6} color="#D4AF37" floatIntensity={0.8} />}

        {/* PEARLS */}
        {config.pearls > 0 && <FloatingJewelryModel type="pearl" position={[2, 1.5, 3]} scale={0.25} speed={1.5} />}
        {config.pearls > 1 && <FloatingJewelryModel type="pearl" position={[-1, 3, -1]} scale={0.3} speed={1.0} />}
        {config.pearls > 2 && <FloatingJewelryModel type="pearl" position={[4, 0, -3]} scale={0.35} speed={1.1} />}
        {config.pearls > 3 && <FloatingJewelryModel type="pearl" position={[-2.5, -1, -3]} scale={0.2} speed={1.3} floatIntensity={1.5} />}
        {config.pearls > 4 && <FloatingJewelryModel type="pearl" position={[1, -1.5, 2]} scale={0.25} speed={1.6} />}
        {config.pearls > 5 && <FloatingJewelryModel type="pearl" position={[-3, 0, 1]} scale={0.3} speed={0.9} />}

        {/* GEMS */}
        {config.gems > 0 && <FloatingJewelryModel type="gem" position={[-1.5, -1, 4]} scale={0.25} speed={2.5} />}
        {config.gems > 1 && <FloatingJewelryModel type="gem" position={[2.5, 2.5, 1]} scale={0.2} speed={1.5} />}
        {config.gems > 2 && <FloatingJewelryModel type="gem" position={[0, -3, 1]} scale={0.15} speed={2.0} />}
        {config.gems > 3 && <FloatingJewelryModel type="gem" position={[-3.5, 0.5, -2]} scale={0.3} speed={1.8} />}
        {config.gems > 4 && <FloatingJewelryModel type="gem" position={[1.5, 0.5, -4]} scale={0.25} speed={2.2} />}
      </group>
    </>
  );
}
