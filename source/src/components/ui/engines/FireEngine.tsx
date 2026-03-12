"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

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

const ThemeFireMaterial = shaderMaterial(
    {
        uTime: 0,
        uResolution: new THREE.Vector2(1, 1),
        uColor1: new THREE.Color("#111111"),
        uColor2: new THREE.Color("#FF003C"),
        uColor3: new THREE.Color("#FFFFFF"),
        uSmokeColor: new THREE.Color("#0a0a0a"),
    },
    `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
    `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uSmokeColor;
  varying vec2 vUv;

  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    const float K1 = 0.366025404;
    const float K2 = 0.211324865;
    vec2 i = floor(p + (p.x + p.y) * K1);
    vec2 a = p - i + (i.x + i.y) * K2;
    vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec2 b = a - o + K2;
    vec2 v = a - 1.0 + 2.0 * K2;
    vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(v, v)), 0.0);
    vec3 n = h * h * h * h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(v, hash(i + 1.0)));
    return dot(n, vec3(70.0));
  }

  float fbm(vec2 p) {
    float f = 0.0;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    f += 0.5000 * noise(p); p = m * p;
    f += 0.2500 * noise(p); p = m * p;
    f += 0.1250 * noise(p); p = m * p;
    f += 0.0625 * noise(p); p = m * p;
    return f;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.7;
    
    vec2 fireQ = uv;
    fireQ.y -= t * 0.6;
    fireQ.x += sin(t * 0.3 + uv.y * 4.0) * 0.08;

    float fireStrength = 1.0 - distance(uv.x, 0.5) * 2.4;
    fireStrength = max(0.0, fireStrength);
    fireStrength *= pow(1.0 - uv.y, 1.2);

    float f = fbm(fireQ * 3.5);
    f = f * 0.5 + 0.5;
    
    float fire = f * fireStrength;
    fire = smoothstep(0.1, 0.8, fire * 1.4);
    
    vec3 fireColor = mix(uColor1, uColor2, fire);
    fireColor = mix(fireColor, uColor3, pow(fire, 3.0));

    vec2 smokeQ = uv;
    smokeQ.y -= t * 0.25;
    smokeQ.x += cos(t * 0.15 + uv.y * 2.5) * 0.15;
    
    float smokeF = fbm(smokeQ * 1.8 + fbm(smokeQ * 3.0));
    smokeF = smokeF * 0.5 + 0.5;
    
    float smokeMask = smoothstep(0.0, 0.7, uv.y) * (1.2 - distance(uv.x, 0.5) * 1.8);
    float smoke = smokeF * smokeMask;
    
    vec3 smokeFinalColor = mix(uColor1, uSmokeColor, smoke);
    float smokeAlpha = smoothstep(0.2, 0.9, smoke) * 0.5;

    vec3 finalColor = mix(smokeFinalColor, fireColor, fire);
    float finalAlpha = max(fire * 0.9, smokeAlpha);

    float coreGlow = (1.0 - distance(uv, vec2(0.5, 0.1))) * 0.4;
    finalColor += uColor2 * max(0.0, coreGlow);

    gl_FragColor = vec4(finalColor, finalAlpha * 0.8);
  }
  `
);

extend({ ThemeFireMaterial });

function FireMesh({ themeColorHex }: { themeColorHex: string }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { size } = useThree();

    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as any;
            material.uTime = state.clock.getElapsedTime();
            material.uResolution.set(size.width, size.height);
            // Sync theme color dynamically:
            material.uColor2.set(themeColorHex);
        }
    });

    return (
        <mesh ref={meshRef} scale={[25, 25, 1]}>
            <planeGeometry args={[1, 1, 64, 64]} />
            {/* @ts-ignore */}
            <themeFireMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
    );
}

export default function FireEngine({ color = "var(--accent)" }: { color?: string }) {
    const hex = useThemeColor(color);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-90 transition-opacity duration-1000">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <color attach="background" args={["#050505"]} />
                <FireMesh themeColorHex={hex} />
            </Canvas>
            <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 0%, black 80%)' }} />
        </div>
    );
}
