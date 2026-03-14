import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function StarField() {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(3000);
    for (let i = 0; i < 3000; i++) {
      arr[i] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.02;
      ref.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#f59e0b"
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
}

function FloatingOrbs() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const orbs = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      position: [
        Math.sin((i / 6) * Math.PI * 2) * 4,
        Math.cos((i / 6) * Math.PI * 2) * 2 + Math.sin(i) * 1.5,
        Math.cos((i / 6) * Math.PI * 2) * 3 - 2,
      ] as [number, number, number],
      scale: 0.15 + Math.random() * 0.25,
      color: i % 2 === 0 ? "#f59e0b" : "#0d9488",
    }));
  }, []);

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position}>
          <sphereGeometry args={[orb.scale, 16, 16]} />
          <meshBasicMaterial color={orb.color} transparent opacity={0.15} />
        </mesh>
      ))}
    </group>
  );
}

const HeroScene = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <StarField />
        <FloatingOrbs />
      </Canvas>
    </div>
  );
};

export default HeroScene;
