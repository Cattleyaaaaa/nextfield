"use client";

import { useEffect, useRef } from "react";
import {
  RADIO_AUDIO_EVENT,
  RADIO_PURE_MODE_EFFECTS,
  type RadioAudioSignal,
} from "@/lib/radio-signal";

type Color = readonly [number, number, number];
type RainDrop = { x: number; depth: number; progress: number; speed: number; length: number };
type RainRipple = { x: number; y: number; age: number; duration: number };

function tint(color: Color, alpha: number) {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
}

function blend(color: Color, neutral: Color, amount: number): Color {
  return color.map((channel, index) =>
    Math.round(channel * (1 - amount) + neutral[index] * amount),
  ) as unknown as Color;
}

/** A canvas scene keeps the perspective field and audio-reactive globe behind the lyrics. */
export function RadioPureScene({
  accent,
  playing,
  motionEnabled,
  dark,
}: {
  accent: Color;
  playing: boolean;
  motionEnabled: boolean;
  dark: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneState = useRef({ accent, playing, motionEnabled, dark });
  sceneState.current = { accent, playing, motionEnabled, dark };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let frameId = 0;
    let lastFrame = 0;
    let bass = 0;
    let targetBass = 0;
    let bars: number[] = [];
    let visualBars: number[] = [];
    let lastDrawTime = 0;
    const drops: RainDrop[] = [];
    const ripples: RainRipple[] = [];
    let rainSpawnProgress = 0;
    let visualAccent: Color = [...sceneState.current.accent];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (!motionEnabled) draw(0);
    };

    const onAudio = (event: Event) => {
      const signal = (event as CustomEvent<RadioAudioSignal>).detail;
      targetBass = sceneState.current.playing ? signal.bass : 0;
      bars = signal.bars;
    };

    function draw(time: number) {
      if (!context || width <= 0 || height <= 0) return;
      const state = sceneState.current;
      visualAccent = visualAccent.map(
        (value, index) => value + (state.accent[index] - value) * 0.075,
      ) as unknown as Color;
      const accent = visualAccent;
      const { playing, motionEnabled, dark } = state;
      const neutral: Color = dark ? [105, 139, 143] : [122, 151, 151];
      const softAccent = blend(accent, neutral, 0.48);
      const secondary = blend(accent, neutral, 0.76);
      if (!playing) targetBass = 0;
      bass += (targetBass - bass) * 0.12;
      visualBars = bars.map((value, index) =>
        (visualBars[index] ?? value) + (value - (visualBars[index] ?? value)) * 0.16,
      );
      const delta = Math.min(0.06, Math.max(0, time - lastDrawTime));
      lastDrawTime = time;
      for (let index = ripples.length - 1; index >= 0; index -= 1) {
        ripples[index].age += delta;
        if (ripples[index].age > ripples[index].duration) ripples.splice(index, 1);
      }
      const centerX = width / 2;
      const horizon = height * 0.51;
      const floorBottom = height * 1.05;
      const orbY = height * 0.4;
      const radius =
        Math.min(width * (width < 640 ? 0.27 : 0.16), height * 0.24, 225) *
        (1 + bass * 0.1 + (!playing && motionEnabled ? (0.012 + 0.012 * Math.sin(time * 1.1)) : 0));

      const background = context.createLinearGradient(0, 0, 0, height);
      background.addColorStop(0, dark ? "#03070f" : "#e8f0ef");
      background.addColorStop(0.56, dark ? "#07101d" : "#dbe8e7");
      background.addColorStop(1, dark ? "#0b1626" : "#cbdcda");
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);

      const aura = context.createRadialGradient(
        centerX,
        orbY,
        radius * 0.25,
        centerX,
        orbY,
        radius * 2.8,
      );
      aura.addColorStop(0, tint(softAccent, 0.13 + bass * 0.1));
      aura.addColorStop(0.5, tint(secondary, 0.055 + bass * 0.045));
      aura.addColorStop(1, dark ? "rgba(0,0,0,0)" : "rgba(255,255,255,0)");
      context.fillStyle = aura;
      context.fillRect(0, 0, width, height);

      for (let index = 0; index < 75; index += 1) {
        const x = (((index * 147.19) % 100) / 100) * width;
        const y = (((index * 73.67) % 100) / 100) * height * 0.66;
        const flicker = motionEnabled
          ? 0.08 * Math.sin(time * 0.7 + index * 2.1)
          : 0;
        context.fillStyle = tint(
          index % 5 === 0 ? secondary : accent,
          0.12 + flicker,
        );
        context.beginPath();
        context.arc(x, y, index % 7 === 0 ? 1.2 : 0.6, 0, Math.PI * 2);
        context.fill();
      }

      const floorGlow = context.createLinearGradient(0, horizon, 0, height);
      floorGlow.addColorStop(0, tint(softAccent, 0.035));
      floorGlow.addColorStop(0.52, tint(softAccent, 0.11 + bass * 0.035));
      floorGlow.addColorStop(1, dark ? "rgba(2,7,14,0.58)" : "rgba(220,235,232,0.55)");
      context.fillStyle = floorGlow;
      context.fillRect(0, horizon, width, height - horizon);

      const floorPoint = (column: number, depth: number) => ({
        x: centerX + column * (width / 28) * (0.085 + 0.915 * depth),
        y:
          horizon +
          Math.pow(depth, 1.78) * (floorBottom - horizon) +
          Math.sin(column * 0.72 + time * 0.4 + depth * 8) *
            (3 + bass * 12) *
            depth,
      });

      // Extruded tiles make the perspective floor visibly pulse with the music.
      if (playing && motionEnabled) {
        rainSpawnProgress += delta * Math.max(0, Math.min(8, RADIO_PURE_MODE_EFFECTS.rainFrequency));
        while (rainSpawnProgress >= 1 && drops.length < 48) {
          drops.push({
            x: 0.08 + Math.random() * 0.84,
            depth: 0.42 + Math.random() * 0.54,
            progress: 0,
            speed: RADIO_PURE_MODE_EFFECTS.dropFallSpeed * (0.88 + Math.random() * 0.24),
            length: 24 + Math.random() * 24,
          });
          rainSpawnProgress -= 1;
        }
        for (let index = drops.length - 1; index >= 0; index -= 1) {
          const drop = drops[index];
          drop.progress += delta * drop.speed;
          if (drop.progress < 1) continue;
          const targetY = horizon + Math.pow(drop.depth, 1.78) * (floorBottom - horizon);
          const duration = Math.max(1.25, Math.min(2.8, (Math.max(width, height) * 0.58) / RADIO_PURE_MODE_EFFECTS.rippleSpeed));
          ripples.push({ x: drop.x * width, y: targetY, age: 0, duration });
          drops.splice(index, 1);
        }
      }

      for (let row = 1; row <= 20; row += 1) {
        const near = row / 20;
        const far = (row - 1) / 20;
        for (let column = -27; column < 27; column += 1) {
          const rawTopLeft = floorPoint(column, far);
          const rawTopRight = floorPoint(column + 1, far);
          const rawBottomRight = floorPoint(column + 1, near);
          const rawBottomLeft = floorPoint(column, near);
          const tileCenterX =
            (rawTopLeft.x + rawTopRight.x + rawBottomRight.x + rawBottomLeft.x) / 4;
          const tileCenterY =
            (rawTopLeft.y + rawTopRight.y + rawBottomRight.y + rawBottomLeft.y) / 4;
          const inset = (point: { x: number; y: number }) => ({
            x: tileCenterX + (point.x - tileCenterX) * 0.94,
            y: tileCenterY + (point.y - tileCenterY) * 0.94,
          });
          const baseTopLeft = inset(rawTopLeft);
          const baseTopRight = inset(rawTopRight);
          const baseBottomRight = inset(rawBottomRight);
          const baseBottomLeft = inset(rawBottomLeft);
          const spectralPosition =
            ((column + 27) / 54) * Math.max(0, visualBars.length - 1) + row * 0.22;
          const lowerIndex = visualBars.length
            ? Math.floor(spectralPosition) % visualBars.length
            : 0;
          const upperIndex = visualBars.length ? (lowerIndex + 1) % visualBars.length : 0;
          const fraction = spectralPosition - Math.floor(spectralPosition);
          const currentBand =
            (visualBars[lowerIndex] ?? 0) * (1 - fraction) +
            (visualBars[upperIndex] ?? 0) * fraction;
          const leftBand = visualBars.length
            ? visualBars[(lowerIndex + visualBars.length - 1) % visualBars.length] ?? 0
            : 0;
          const rightBand = visualBars.length ? visualBars[(upperIndex + 1) % visualBars.length] ?? 0 : 0;
          const energy = currentBand * 0.68 + (leftBand + rightBand) * 0.16;
          let rippleLift = 0;
          let rippleGlow = 0;
          for (const ripple of ripples) {
            const waveRadius = ripple.age * RADIO_PURE_MODE_EFFECTS.rippleSpeed;
            const tileDistance = Math.hypot(tileCenterX - ripple.x, tileCenterY - ripple.y);
            const waveWidth = 42 + near * 8;
            const phase = (tileDistance - waveRadius) / waveWidth;
            const envelope = Math.exp(-phase * phase * 0.72) *
              Math.max(0, 1 - ripple.age / ripple.duration);
            const wave = Math.cos(phase * Math.PI) * envelope;
            rippleLift += wave * 19;
            rippleGlow = Math.max(rippleGlow, Math.abs(wave));
          }
          rippleLift = Math.max(-16, Math.min(24, rippleLift));
          // A small local phase offsets neighboring tiles without creating visual chatter.
          const idleBreath = !playing && motionEnabled
            ? (0.5 + 0.5 * Math.sin(time * 0.85 - column * 0.025 - row * 0.05)) * 0.025
            : 0;
          const localPulse = playing && motionEnabled
            ? (0.5 + 0.5 * Math.sin(time * 1.5 - column * 0.045 - row * 0.09)) * energy * 0.1
            : idleBreath;
          const level = Math.min(1, energy * 0.82 + bass * 0.035 + localPulse);
          const tileVariation =
            0.92 + ((Math.sin(column * 12.9898 + row * 78.233) + 1) / 2) * 0.16;
          const baseLift = (1 + level * 38 * tileVariation) * Math.pow(near, 1.1);
          const lift = Math.max(0.35, baseLift + rippleLift * Math.pow(near, 1.1));
          const topLeft = { x: baseTopLeft.x, y: baseTopLeft.y - lift };
          const topRight = { x: baseTopRight.x, y: baseTopRight.y - lift };
          const bottomRight = { x: baseBottomRight.x, y: baseBottomRight.y - lift };
          const bottomLeft = { x: baseBottomLeft.x, y: baseBottomLeft.y - lift };
          const edge = tint(softAccent, dark ? 0.24 : 0.22);
          const sideAlpha = (dark ? 0.05 : 0.06) + near * 0.1 + level * 0.1 + rippleGlow * 0.12;

          // Front face
          context.beginPath();
          context.moveTo(baseBottomLeft.x, baseBottomLeft.y);
          context.lineTo(baseBottomRight.x, baseBottomRight.y);
          context.lineTo(bottomRight.x, bottomRight.y);
          context.lineTo(bottomLeft.x, bottomLeft.y);
          context.closePath();
          context.fillStyle = tint(secondary, sideAlpha);
          context.fill();
          context.strokeStyle = edge;
          context.lineWidth = 1;
          context.stroke();

          // Right face
          context.beginPath();
          context.moveTo(baseTopRight.x, baseTopRight.y);
          context.lineTo(baseBottomRight.x, baseBottomRight.y);
          context.lineTo(bottomRight.x, bottomRight.y);
          context.lineTo(topRight.x, topRight.y);
          context.closePath();
          context.fillStyle = tint(softAccent, sideAlpha * 0.82);
          context.fill();
          context.strokeStyle = edge;
          context.stroke();

          context.beginPath();
          context.moveTo(topLeft.x, topLeft.y);
          context.lineTo(topRight.x, topRight.y);
          context.lineTo(bottomRight.x, bottomRight.y);
          context.lineTo(bottomLeft.x, bottomLeft.y);
          context.closePath();
          context.fillStyle = tint(
            (row + column) % 4 === 0 ? softAccent : secondary,
            (dark ? 0.07 : 0.09) + near * (dark ? 0.14 : 0.16) + level * 0.08 + rippleGlow * 0.14,
          );
          context.fill();
          context.strokeStyle = edge;
          context.lineWidth = 1;
          context.stroke();
        }
      }

      // The soft streak ends at the same ground point that drives the tile wave.
      if (playing && motionEnabled) {
        for (const drop of drops) {
          const targetY =
            horizon + Math.pow(drop.depth, 1.78) * (floorBottom - horizon);
          const x = drop.x * width;
          const y = Math.min(targetY, Math.max(0, targetY * drop.progress));
          const trail = Math.min(drop.length, y);
          const gradient = context.createLinearGradient(x, y - trail, x, y);
          gradient.addColorStop(0, tint(softAccent, 0));
          gradient.addColorStop(1, tint(softAccent, 0.88 + bass * 0.08));
          context.save();
          context.shadowColor = tint(softAccent, 0.9);
          context.shadowBlur = 12;
          context.strokeStyle = gradient;
          context.lineWidth = 2.2;
          context.beginPath();
          context.moveTo(x, y - trail);
          context.lineTo(x, y);
          context.stroke();
          context.fillStyle = tint(softAccent, 0.98);
          context.beginPath();
          context.arc(x, y, 2, 0, Math.PI * 2);
          context.fill();
          context.restore();
        }
      }

      const breath = motionEnabled ? (Math.sin(time * 1.7) + 1) * 0.5 : 0.5;
      const halo = context.createRadialGradient(
        centerX,
        orbY,
        radius * 0.55,
        centerX,
        orbY,
        radius * 1.55,
      );
      halo.addColorStop(0, tint(accent, 0.3 + breath * 0.26 + bass * 0.12));
      halo.addColorStop(0.5, tint(accent, 0.14 + breath * 0.15 + bass * 0.05));
      halo.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = halo;
      context.beginPath();
      context.arc(centerX, orbY, radius * 1.55, 0, Math.PI * 2);
      context.fill();

      const globe = context.createRadialGradient(
        centerX,
        orbY,
        radius * 0.025,
        centerX,
        orbY,
        radius,
      );
      globe.addColorStop(0, tint(accent, 0.58 + bass * 0.08));
      globe.addColorStop(0.34, tint(accent, 0.28 + bass * 0.05));
      globe.addColorStop(0.68, dark ? "rgba(13,32,61,0.72)" : "rgba(229,243,242,0.64)");
      globe.addColorStop(1, dark ? "rgba(3,10,25,0.9)" : "rgba(202,224,222,0.78)");
      context.fillStyle = globe;
      context.beginPath();
      context.arc(centerX, orbY, radius, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = tint(accent, 0.62 + bass * 0.2);
      context.lineWidth = 1.5;
      context.stroke();

      const rotation = time * (playing ? 0.12 : 0.035);
      const project = (latitude: number, longitude: number) => {
        const latCos = Math.cos(latitude);
        const x = latCos * Math.sin(longitude);
        const y = Math.sin(latitude);
        const z = latCos * Math.cos(longitude);
        const rotatedX = x * Math.cos(rotation) + z * Math.sin(rotation);
        const rotatedZ = z * Math.cos(rotation) - x * Math.sin(rotation);
        const frequency =
          visualBars[
            Math.floor((longitude / (Math.PI * 2)) * Math.max(1, visualBars.length))
          ] ?? 0;
        const waveform = 1 + bass * 0.035 + frequency * 0.018;
        return {
          x: centerX + rotatedX * radius * waveform,
          y: orbY + y * radius * waveform,
          z: rotatedZ,
        };
      };

      // Draw the front half of the globe as luminous latitude and longitude threads.
      for (let latitudeLine = -4; latitudeLine <= 4; latitudeLine += 1) {
        const latitude = (latitudeLine * Math.PI) / 11;
        context.beginPath();
        let visible = false;
        for (let segment = 0; segment <= 100; segment += 1) {
          const point = project(latitude, (segment / 100) * Math.PI * 2);
          if (point.z < -0.04) {
            visible = false;
            continue;
          }
          if (!visible) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
          visible = true;
        }
        context.strokeStyle = tint(
          latitudeLine % 2 === 0 ? accent : secondary,
          0.25 + bass * 0.16,
        );
        context.lineWidth = 0.85;
        context.stroke();
      }
      for (let longitudeLine = 0; longitudeLine < 16; longitudeLine += 1) {
        const longitude = (longitudeLine / 16) * Math.PI * 2;
        context.beginPath();
        let visible = false;
        for (let segment = 0; segment <= 60; segment += 1) {
          const point = project((segment / 60 - 0.5) * Math.PI, longitude);
          if (point.z < -0.04) {
            visible = false;
            continue;
          }
          if (!visible) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
          visible = true;
        }
        context.strokeStyle = tint(
          longitudeLine % 3 === 0 ? secondary : accent,
          0.26 + bass * 0.15,
        );
        context.lineWidth = 0.8;
        context.stroke();
      }

      context.save();
      context.translate(centerX, orbY);
      context.rotate(-0.2);
      context.beginPath();
      context.ellipse(0, 0, radius * 1.3, radius * 0.27, 0, 0, Math.PI * 2);
      context.strokeStyle = tint(secondary, 0.28 + bass * 0.22);
      context.lineWidth = 1.15;
      context.stroke();
      context.restore();
    }

    const animate = (timestamp: number) => {
      frameId = window.requestAnimationFrame(animate);
      if (timestamp - lastFrame < 1000 / 30) return;
      lastFrame = timestamp;
      draw(timestamp / 1000);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener(RADIO_AUDIO_EVENT, onAudio);
    resize();
    if (motionEnabled) frameId = window.requestAnimationFrame(animate);
    return () => {
      observer.disconnect();
      window.removeEventListener(RADIO_AUDIO_EVENT, onAudio);
      window.cancelAnimationFrame(frameId);
    };
  }, [motionEnabled]);

  return (
    <canvas
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full"
      ref={canvasRef}
    />
  );
}
