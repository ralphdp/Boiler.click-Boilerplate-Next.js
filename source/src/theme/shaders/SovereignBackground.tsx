"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { ACTIVE_THEME } from "@/theme/config";

const SovereignShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uResolution: new THREE.Vector2(1, 1),
    uColor1: new THREE.Color("#050505"),
    uColor2: new THREE.Color("#a855f7"),
    uColor3: new THREE.Color("#ffffff"),
  },
  // Vertex Shader
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment Shader
  `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
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
    float t = uTime * 0.5;
    
    vec2 q = uv;
    q.y -= t * 0.4;
    q.x += sin(t * 0.2 + uv.y * 3.0) * 0.1;

    float strength = 1.0 - distance(uv.x, 0.5) * 2.0;
    strength = max(0.0, strength);
    strength *= pow(1.0 - uv.y, 1.5);

    float f = fbm(q * 4.0);
    f = f * 0.5 + 0.5;
    
    float intensity = f * strength;
    intensity = smoothstep(0.1, 0.9, intensity * 1.2);
    
    vec3 color = mix(uColor1, uColor2, intensity);
    color = mix(color, uColor3, pow(intensity, 4.0));

    gl_FragColor = vec4(color, intensity * 1.5);
  }
  `
);

extend({ SovereignShaderMaterial });

function ShaderMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as any;
      material.uTime = state.clock.getElapsedTime();
      material.uResolution.set(size.width, size.height);

      const accentHex = document.documentElement.style.getPropertyValue('--accent');
      if (accentHex) {
        material.uColor2.set(accentHex);
      } else {
        material.uColor2.set(ACTIVE_THEME.primaryColor);
      }
    }
  });

  return (
    <mesh ref={meshRef} scale={[25, 25, 1]}>
      <planeGeometry args={[1, 1, 16, 16]} />
      {/* @ts-ignore */}
      <sovereignShaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

export default function SovereignBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-85">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={["#050505"]} />
        <ShaderMesh />
      </Canvas>
    </div>
  );
}
