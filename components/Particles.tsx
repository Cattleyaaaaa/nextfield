"use client";

// Installed from React Bits Particles-TS-TW; adapted for quiet, screen-space dust.
// https://reactbits.dev/backgrounds/particles
import React, { useEffect, useRef } from 'react';
import { Renderer, Geometry, Program, Mesh } from 'ogl';

interface ParticlesProps {
  particleCount?: number;
  speed?: number;
  particleColors?: string[];
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  particleBaseSize?: number;
  hoverRadius?: number;
  hoverSmoothing?: number;
  paused?: boolean;
  pixelRatio?: number;
  className?: string;
}

const defaultColors: string[] = ['#b3ceca'];

const hexToRgb = (hex: string): [number, number, number] => {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(c => c + c)
      .join('');
  }
  const int = parseInt(hex.slice(0, 6), 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  return [r, g, b];
};

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  
  uniform float uTime;
  uniform float uBaseSize;
  uniform vec2 uViewport;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uHoverRadius;
  
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vRandom = random;
    vColor = color;
    
    float t = uTime;
    // Independent, long-period curved paths; no rotation or whole-cloud motion.
    vec2 drift = vec2(
      sin(t * (0.7 + random.z) + 6.28 * random.w) + 0.35 * sin(t * 0.43 + random.x * 6.28),
      sin(t * (0.6 + random.y) + 6.28 * random.x) + 0.35 * cos(t * 0.37 + random.w * 6.28)
    ) * 12.0;
    vec2 pos = position.xy + drift * 2.0 / uViewport;
    vec2 distancePx = (pos - uMouse) * uViewport * 0.5;
    float distanceToMouse = length(distancePx);
    float influence = 1.0 - smoothstep(0.0, uHoverRadius, distanceToMouse);
    pos += distancePx / max(distanceToMouse, 0.001) * influence * uHover * 2.0 / uViewport;
    gl_PointSize = uBaseSize;
    gl_Position = vec4(pos, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  
  uniform float uTime;
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));
    
    float circle = 1.0 - smoothstep(0.15, 0.5, d);
    float breath = 0.9 + 0.1 * sin(uTime * 1.7 + vRandom.y * 6.28);
    float alpha = circle * breath;
    gl_FragColor = vec4(vColor * alpha, alpha);
  }
`;

const Particles: React.FC<ParticlesProps> = ({
  particleCount = 200,
  speed = 0.1,
  particleColors,
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  particleBaseSize = 2,
  hoverRadius = 100,
  hoverSmoothing = 0.08,
  paused = false,
  pixelRatio = 1,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, pixelRatio), depth: false, alpha: true, premultipliedAlpha: true, antialias: false });
    } catch {
      // The page and badge remain usable on devices without WebGL.
      return;
    }
    const gl = renderer.gl;
    if (!gl) return;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);
    mouseRef.current = { x: 0, y: 0, active: false };

    const handleMouseMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      // Do not react to pointers over the badge dialog or navigation.
      const blocked = e.target instanceof Element && !!e.target.closest('[role="dialog"], header');
      mouseRef.current = { x, y, active: !blocked && Math.abs(x) <= 1 && Math.abs(y) <= 1 };
    };
    const resetMouse = () => { mouseRef.current.active = false; };
    const onPointerOut = (event: PointerEvent) => { if (!event.relatedTarget) resetMouse(); };

    if (moveParticlesOnHover) {
      window.addEventListener('pointermove', handleMouseMove, { passive: true });
      window.addEventListener('pointerout', onPointerOut, { passive: true });
      window.addEventListener('blur', resetMouse);
    }

    const count = particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette = particleColors && particleColors.length > 0 ? particleColors : defaultColors;

    const columns = Math.max(1, Math.round(Math.sqrt(count * container.clientWidth / Math.max(container.clientHeight, 1))));
    const rows = Math.ceil(count / columns);
    for (let i = 0; i < count; i++) {
      // Jittered cells cover the viewport evenly without dense random clusters.
      const row = Math.floor(i / columns);
      const cellsInRow = Math.min(columns, count - row * columns);
      const x = ((i % columns + 0.2 + Math.random() * 0.6) / cellsInRow) * 2 - 1;
      const y = ((row + 0.2 + Math.random() * 0.6) / rows) * 2 - 1;
      positions.set([x, y, 0], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
      colors.set(col, i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors }
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uBaseSize: { value: particleBaseSize * renderer.dpr },
        uViewport: { value: [1, 1] },
        uMouse: { value: [0, 0] },
        uHover: { value: 0 },
        uHoverRadius: { value: hoverRadius }
      },
      transparent: true,
      depthTest: false
    });

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program, frustumCulled: false });

    const render = () => renderer.render({ scene: particles });
    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      renderer.setSize(width, height);
      program.uniforms.uViewport.value = [width, height];
      render();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    let animationFrameId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    const update = (t: number) => {
      const delta = Math.min(t - lastTime, 50);
      lastTime = t;
      elapsed += delta * speed;

      program.uniforms.uTime.value = elapsed * 0.001;

      const smoothing = 1 - Math.pow(1 - hoverSmoothing, delta / (1000 / 60));
      const mouse = program.uniforms.uMouse.value;
      mouse[0] += (mouseRef.current.x - mouse[0]) * smoothing;
      mouse[1] += (mouseRef.current.y - mouse[1]) * smoothing;
      const targetHover = moveParticlesOnHover && mouseRef.current.active ? particleHoverFactor : 0;
      program.uniforms.uHover.value += (targetHover - program.uniforms.uHover.value) * smoothing;
      render();
      animationFrameId = requestAnimationFrame(update);
    };

    const onVisibilityChange = () => {
      cancelAnimationFrame(animationFrameId);
      resetMouse();
      lastTime = performance.now();
      if (!document.hidden && !paused) animationFrameId = requestAnimationFrame(update);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    onVisibilityChange();

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (moveParticlesOnHover) {
        window.removeEventListener('pointermove', handleMouseMove);
        window.removeEventListener('pointerout', onPointerOut);
        window.removeEventListener('blur', resetMouse);
      }
      cancelAnimationFrame(animationFrameId);
      geometry.remove();
      program.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
  }, [
    particleCount,
    particleColors,
    speed,
    moveParticlesOnHover,
    particleHoverFactor,
    particleBaseSize,
    hoverRadius,
    hoverSmoothing,
    paused,
    pixelRatio
  ]);

  return <div ref={containerRef} className={`relative w-full h-full ${className}`} />;
};

export default Particles;
