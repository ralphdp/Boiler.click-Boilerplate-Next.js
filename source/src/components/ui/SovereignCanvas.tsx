'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Instances, Instance, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Configuration for generating the particle field
const PARTICLE_COUNT = 800;
const RADIUS = 4;

function Particles() {
    const ref = useRef<THREE.InstancedMesh>(null);

    // Generate deterministic random positions on a sphere
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Use spherical coordinates to distribute evenly
            const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
            const theta = Math.sqrt(PARTICLE_COUNT * Math.PI) * phi;

            const position = new THREE.Vector3().setFromSphericalCoords(RADIUS, phi, theta);

            // Add slight noise to the radius
            position.multiplyScalar(0.9 + Math.random() * 0.2);

            temp.push({
                position,
                scale: 0.02 + Math.random() * 0.04,
                speed: 0.1 + Math.random() * 0.3,
                axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
            });
        }
        return temp;
    }, []);

    // Animate particles slowly
    useFrame((state) => {
        if (!ref.current) return;
        const time = state.clock.getElapsedTime();

        // Slowly rotate the entire field
        ref.current.rotation.y = time * 0.05;
        ref.current.rotation.z = time * 0.02;
    });

    return (
        <Instances
            limit={PARTICLE_COUNT}
            ref={ref}
            castShadow={false}
            receiveShadow={false}
        >
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.6}
                blending={THREE.AdditiveBlending}
            />
            {particles.map((data, i) => (
                <Instance
                    key={i}
                    position={data.position}
                    scale={data.scale}
                />
            ))}
        </Instances>
    );
}

// Intersecting wireframe rings that rotate independently
function Rings() {
    const ring1 = useRef<THREE.Mesh>(null);
    const ring2 = useRef<THREE.Mesh>(null);
    const ring3 = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (ring1.current) {
            ring1.current.rotation.x = t * 0.2;
            ring1.current.rotation.y = t * 0.1;
        }
        if (ring2.current) {
            ring2.current.rotation.y = t * 0.25;
            ring2.current.rotation.z = t * 0.15;
        }
        if (ring3.current) {
            ring3.current.rotation.z = t * 0.3;
            ring3.current.rotation.x = t * 0.2;
        }
    });

    const material = new THREE.MeshBasicMaterial({
        color: '#a855f7', // Purple-500 equivalent color
        wireframe: true,
        transparent: true,
        opacity: 0.15,
    });

    return (
        <group>
            <mesh ref={ring1} material={material}>
                <torusGeometry args={[RADIUS * 1.2, 0.02, 16, 100]} />
            </mesh>
            <mesh ref={ring2} material={material}>
                <torusGeometry args={[RADIUS * 1.5, 0.02, 16, 100]} />
            </mesh>
            <mesh ref={ring3} material={material}>
                <torusGeometry args={[RADIUS * 1.8, 0.02, 16, 100]} />
            </mesh>
        </group>
    );
}

// Core object in the center
function Core() {
    const ref = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.getElapsedTime();
        ref.current.rotation.x = t * 0.1;
        ref.current.rotation.y = t * 0.2;
        // Breathing effect
        const scale = 1 + Math.sin(t * 2) * 0.05;
        ref.current.scale.set(scale, scale, scale);
    });

    return (
        <mesh ref={ref}>
            <octahedronGeometry args={[1.5, 0]} />
            <meshStandardMaterial
                color="#000000"
                roughness={0.1}
                metalness={0.8}
                wireframe={true}
            />
            {/* Inner glowing core */}
            <mesh>
                <octahedronGeometry args={[1.4, 0]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
            </mesh>
        </mesh>
    );
}

export default function SovereignCanvas({
    className = "w-full h-full absolute inset-0 z-0 pointer-events-none"
}: {
    className?: string
}) {
    return (
        <div className={className}>
            <Canvas
                camera={{ position: [0, 0, 12], fov: 45 }}
                gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                dpr={[1, 2]} // Optimize pixel ratio
            >
                <color attach="background" args={['transparent']} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />

                <group>
                    <Core />
                    <Rings />
                    <Particles />
                </group>

                {/* Slows down camera control, disables zooming, removes pointer events ideally handled in CSS */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    maxPolarAngle={Math.PI / 2 + 0.3}
                    minPolarAngle={Math.PI / 2 - 0.3}
                />
            </Canvas>
        </div>
    );
}
