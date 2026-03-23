"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PerspectiveCamera, PointMaterial } from "@react-three/drei";
import { motion } from "framer-motion";

function useThemeColor(defaultColor: string) {
    const [hex, setHex] = useState(defaultColor.includes("var(") ? "#FFFFFF" : defaultColor);
    useEffect(() => {
        if (!defaultColor.includes("var(")) return;
        const update = () => {
            const computed = window.getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
            if (computed) setHex(computed);
        };
        update();
        const obs = new MutationObserver(update);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });
        return () => obs.disconnect();
    }, [defaultColor]);
    return hex;
}

function VortexStars({ resonance = 1.0, themeColorHex }: { resonance?: number, themeColorHex: string }) {
    const pointsRef = useRef<THREE.Points>(null!);
    const count = 2000;

    const [positions, velocities] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const vel = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const r = 5 + Math.random() * 30;
            pos[i * 3] = Math.cos(theta) * r;
            pos[i * 3 + 1] = Math.sin(theta) * r;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
            vel[i] = 0.05 + Math.random() * 0.2;
        }
        return [pos, vel];
    }, [count]);

    useFrame((_state, delta) => {
        if (!pointsRef.current) return;
        const positionsArr = pointsRef.current.geometry.attributes.position.array as Float32Array;
        const speedBase = 10 * resonance;

        for (let i = 0; i < count; i++) {
            positionsArr[i * 3 + 2] += velocities[i] * speedBase * delta;

            const x = positionsArr[i * 3];
            const y = positionsArr[i * 3 + 1];
            const angle = 0.01 * delta * resonance;
            positionsArr[i * 3] = x * Math.cos(angle) - y * Math.sin(angle);
            positionsArr[i * 3 + 1] = x * Math.sin(angle) + y * Math.cos(angle);

            if (positionsArr[i * 3 + 2] > 25) {
                positionsArr[i * 3 + 2] = -75;
            }
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <PointMaterial
                transparent
                color={themeColorHex}
                size={0.12}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                opacity={0.6}
            />
        </points>
    );
}

function TronGrid({ themeColorHex }: { themeColorHex: string }) {
    const floorRef = useRef<THREE.Mesh>(null!);

    const shader = useMemo(() => ({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(themeColorHex) },
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color;
            varying vec2 vUv;
            
            void main() {
                float speed = time * 0.4;
                vec2 gridUv = vUv * 60.0; 
                gridUv.y += speed; 
                
                vec2 grid = abs(fract(gridUv - 0.5) - 0.5) / (fwidth(gridUv) * 1.5);
                float line = min(grid.x, grid.y);
                float strength = 1.0 - min(line, 1.0);
                
                float distMask = smoothstep(1.0, 0.2, vUv.y);
                float centerGlow = smoothstep(0.005, 0.0, abs(vUv.x - 0.5));
                
                vec3 finalColor = color * (strength * 1.2 + centerGlow * 1.0);
                float alpha = (strength * 0.8 + centerGlow * 0.3) * distMask;
                
                gl_FragColor = vec4(finalColor, alpha);
            }
        `
    }), []); // Intentionally keep shader creation static to avoid re-mounting geometry. Update color via uniform.

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (floorRef.current) {
            const mat = floorRef.current.material as THREE.ShaderMaterial;
            mat.uniforms.time.value = t;
            mat.uniforms.color.value.set(themeColorHex); // Dynamically update the grid color over time.
        }
    });

    return (
        <group>
            <mesh ref={floorRef} rotation={[-Math.PI / 2 - 0.25, 0, 0]} position={[0, -8, 0]}>
                <planeGeometry args={[400, 400]} />
                <shaderMaterial args={[shader]} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
        </group>
    );
}

export default function GalaxyEngine({ color = "var(--accent)", zIndex = 0 }: { color?: string, zIndex?: number }) {
    const hex = useThemeColor(color);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden bg-black transition-opacity duration-1000" style={{ zIndex }}>
            <motion.div
                initial={{ scale: 1.1, opacity: 0.45 }}
                animate={{
                    scale: [1.1, 1.4],
                    opacity: [0.45, 0.6, 0.45],
                    rotate: [0, 2, 0]
                }}
                transition={{
                    duration: 120,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut"
                }}
                className="absolute inset-0 mix-blend-screen bg-no-repeat bg-cover bg-center pointer-events-none will-change-transform z-[1]"
                style={{ backgroundImage: 'url("https://rddp.ai/images/cosmos-nebula.png")', filter: `hue-rotate(0deg)` }} // Fallback image if local unavailable
            />

            <div className="absolute inset-0 z-[2]">
                <Canvas dpr={[1, 2]} gl={{ alpha: true }}>
                    <PerspectiveCamera makeDefault position={[0, 8, 25]} fov={60} rotation={[-0.2, 0, 0]} />
                    <ambientLight intensity={0.5} />
                    <VortexStars resonance={1.0} themeColorHex={hex} />
                    <TronGrid themeColorHex={hex} />
                </Canvas>
            </div>

            <div className="absolute inset-0 z-[3]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-70 z-[4]" />

            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-[5]" />
        </div>
    );
}
