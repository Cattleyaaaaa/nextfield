'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Canvas,
  extend,
  useFrame,
  type ThreeElement,
  type ThreeEvent
} from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

import lanyard from './lanyard.png';

const cardGLB = '/models/nextfield-id.glb';

extend({ MeshLineGeometry, MeshLineMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

// 1x1 transparent pixel — lets useTexture be called unconditionally when a
// front/back image isn't supplied.
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// The card model's front face is UV-mapped to the LEFT half of the texture
// atlas and the back face to the RIGHT half (measured from card.glb). Each
// custom image is composited into its own half so the two faces render
// independently, aspect-preserving (no stretching).
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = (): void => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative z-0 w-full h-screen flex justify-center items-center transform scale-100 origin-center">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            frontImage={frontImage}
            backImage={backImage}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  frontImage?: string | null;
  backImage?: string | null;
  imageFit?: 'cover' | 'contain';
  lanyardImage?: string | null;
  lanyardWidth?: number;
}

type LanyardRigidBody = RapierRigidBody & {
  lerped?: THREE.Vector3;
};

type CardModel = {
  nodes: {
    card: THREE.Mesh;
    clip: THREE.Mesh;
    clamp: THREE.Mesh;
  };
  materials: {
    base: THREE.MeshStandardMaterial;
    metal: THREE.MeshStandardMaterial;
  };
};

type TextureImage = CanvasImageSource & {
  width: number;
  height: number;
};

type TextureRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawTrackedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  let cursor = x;
  for (const letter of text) {
    ctx.fillText(letter, cursor, y);
    cursor += ctx.measureText(letter).width + spacing;
  }
}

function drawFittedImage(
  ctx: CanvasRenderingContext2D,
  image: TextureImage,
  rect: TextureRect,
  imageFit: 'cover' | 'contain'
) {
  const ratio = imageFit === 'contain' ? Math.min : Math.max;
  const scale = ratio(rect.w / image.width, rect.h / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  ctx.drawImage(image, rect.x + (rect.w - width) / 2, rect.y + (rect.h - height) / 2, width, height);
}

function drawPortraitFallback(ctx: CanvasRenderingContext2D, rect: TextureRect) {
  const { x, y, w, h } = rect;
  const background = ctx.createLinearGradient(x, y, x + w, y + h);
  background.addColorStop(0, '#929292');
  background.addColorStop(0.52, '#313131');
  background.addColorStop(1, '#080808');
  ctx.fillStyle = background;
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  for (let row = 0; row < 16; row += 1) {
    ctx.fillRect(x, y + row * (h / 16), w, 1);
  }

  ctx.fillStyle = '#dedede';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.5, y + h * 0.34, w * 0.2, h * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#181818';
  ctx.fillRect(x + w * 0.28, y + h * 0.3, w * 0.44, h * 0.11);
  ctx.fillStyle = '#212121';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.5, y + h * 1.06, w * 0.5, h * 0.58, 0, Math.PI, Math.PI * 2);
  ctx.fill();
}

function drawBarcode(ctx: CanvasRenderingContext2D, rect: TextureRect) {
  const widths = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 1, 3, 2];
  const unit = rect.w / widths.reduce((sum, width) => sum + width + 1, 0);
  let x = rect.x;
  ctx.fillStyle = '#f5f5f5';
  widths.forEach((width, index) => {
    ctx.fillRect(x, rect.y, width * unit, rect.h * (index % 5 === 0 ? 1 : 0.82));
    x += (width + 1) * unit;
  });
}

function drawCardFront(
  ctx: CanvasRenderingContext2D,
  rect: TextureRect,
  portrait: TextureImage | null,
  imageFit: 'cover' | 'contain'
) {
  const { x, y, w, h } = rect;
  const pad = w * 0.072;
  const titleSize = w * 0.135;
  const microSize = w * 0.027;
  const smallSize = w * 0.033;
  const photoRect = { x: x + pad, y: y + h * 0.39, w: w - pad * 2, h: h * 0.265 };

  ctx.save();
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(x, y, w, h);
  const edge = ctx.createLinearGradient(x, y, x + w, y + h);
  edge.addColorStop(0, 'rgba(255,255,255,0.16)');
  edge.addColorStop(0.12, 'rgba(255,255,255,0)');
  edge.addColorStop(0.78, 'rgba(255,255,255,0)');
  edge.addColorStop(1, 'rgba(255,255,255,0.1)');
  ctx.fillStyle = edge;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = Math.max(1, w * 0.006);
  ctx.strokeRect(x + w * 0.018, y + w * 0.018, w - w * 0.036, h - w * 0.036);

  ctx.fillStyle = '#121212';
  ctx.beginPath();
  ctx.arc(x + w * 0.5, y + h * 0.061, w * 0.037, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.62)';
  ctx.stroke();
  ctx.fillStyle = '#d9d9d9';
  ctx.beginPath();
  ctx.arc(x + w * 0.5, y + h * 0.061, w * 0.012, 0, Math.PI * 2);
  ctx.fill();

  roundedRect(ctx, x + w - pad - w * 0.14, y + h * 0.048, w * 0.14, h * 0.048, w * 0.012);
  ctx.fillStyle = '#f2f2f2';
  ctx.fill();
  ctx.fillStyle = '#0a0a0a';
  ctx.font = `700 ${microSize}px Inter, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('2026', x + w - pad - w * 0.07, y + h * 0.072);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(255,255,255,0.56)';
  ctx.font = `700 ${microSize}px Inter, Arial, sans-serif`;
  drawTrackedText(ctx, 'STUDIO ACCESS', x + pad, y + h * 0.12, microSize * 0.14);
  ctx.fillStyle = '#f6f6f6';
  ctx.font = `900 ${titleSize}px Arial Black, Inter, Arial, sans-serif`;
  ctx.fillText('peng-12', x + pad, y + h * 0.21);
  ctx.fillStyle = 'rgba(255,255,255,0.56)';
  ctx.font = `600 ${smallSize}px Inter, Arial, sans-serif`;
  drawTrackedText(ctx, 'AGENT & FULL-STACK', x + pad, y + h * 0.263, smallSize * 0.1);
  drawTrackedText(ctx, 'DEVELOPER', x + pad, y + h * 0.302, smallSize * 0.1);

  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = Math.max(1, w * 0.004);
  ctx.beginPath();
  ctx.moveTo(x + pad, y + h * 0.344);
  ctx.lineTo(x + w - pad, y + h * 0.344);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.font = `700 ${microSize}px Inter, Arial, sans-serif`;
  drawTrackedText(ctx, 'ABSTRACT PORTFOLIO', x + pad, y + h * 0.375, microSize * 0.14);

  ctx.save();
  roundedRect(ctx, photoRect.x, photoRect.y, photoRect.w, photoRect.h, w * 0.022);
  ctx.clip();
  if (portrait) {
    ctx.filter = 'grayscale(1) contrast(1.22)';
    drawFittedImage(ctx, portrait, photoRect, imageFit);
    ctx.filter = 'none';
  } else {
    drawPortraitFallback(ctx, photoRect);
  }
  const film = ctx.createLinearGradient(photoRect.x, photoRect.y, photoRect.x + photoRect.w, photoRect.y + photoRect.h);
  film.addColorStop(0, 'rgba(255,255,255,0.08)');
  film.addColorStop(0.48, 'rgba(255,255,255,0)');
  film.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = film;
  ctx.fillRect(photoRect.x, photoRect.y, photoRect.w, photoRect.h);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.42)';
  ctx.strokeRect(photoRect.x, photoRect.y, photoRect.w, photoRect.h);
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.font = `600 ${microSize}px Inter, Arial, sans-serif`;
  drawTrackedText(ctx, 'ABSTRACT PORTRAIT / 01', photoRect.x + w * 0.022, photoRect.y + photoRect.h - h * 0.018, microSize * 0.12);

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = `700 ${microSize}px Inter, Arial, sans-serif`;
  drawTrackedText(ctx, 'IDENTITY', x + pad, y + h * 0.724, microSize * 0.17);
  ctx.fillStyle = '#f6f6f6';
  ctx.font = `800 ${w * 0.065}px Inter, Arial, sans-serif`;
  ctx.fillText('Shin', x + pad, y + h * 0.785);
  ctx.fillStyle = 'rgba(255,255,255,0.56)';
  ctx.font = `600 ${smallSize}px Inter, Arial, sans-serif`;
  drawTrackedText(ctx, 'AGENT SYSTEMS', x + pad, y + h * 0.824, smallSize * 0.1);

  drawBarcode(ctx, { x: x + pad, y: y + h * 0.87, w: w * 0.58, h: h * 0.052 });
  ctx.fillStyle = 'rgba(255,255,255,0.58)';
  ctx.font = `700 ${microSize}px ui-monospace, SFMono-Regular, monospace`;
  ctx.textAlign = 'right';
  ctx.fillText('PG-013-26', x + w - pad, y + h * 0.92);

  ctx.globalAlpha = 0.1;
  ctx.fillStyle = '#ffffff';
  for (let index = 0; index < 110; index += 1) {
    const noiseX = x + ((index * 37) % 101) / 101 * w;
    const noiseY = y + ((index * 61) % 103) / 103 * h;
    ctx.fillRect(noiseX, noiseY, 1, 1);
  }
  ctx.restore();
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  backImage = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1
}: BandProps) {
  const band = useRef<THREE.Mesh<InstanceType<typeof MeshLineGeometry>, InstanceType<typeof MeshLineMaterial>>>(null!);
  const fixed = useRef<RapierRigidBody>(null!);
  const j1 = useRef<LanyardRigidBody>(null!);
  const j2 = useRef<LanyardRigidBody>(null!);
  const j3 = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps: RigidBodyProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4
  };

  const getLerped = (body: LanyardRigidBody): THREE.Vector3 => {
    if (!body.lerped) {
      body.lerped = new THREE.Vector3().copy(body.translation());
    }

    return body.lerped;
  };

  const { nodes, materials } = useGLTF(cardGLB) as unknown as CardModel;
  const bundledLanyard = typeof lanyard === 'string' ? lanyard : lanyard.src;
  const texture = useTexture(lanyardImage || bundledLanyard) as THREE.Texture;
  // useTexture must be called unconditionally; use a blank pixel when an image
  // isn't supplied for a given face, then skip compositing it below.
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);

  // The front half of the GLB atlas receives the complete work-pass design.
  // The back half keeps the original texture unless a custom back image is supplied.
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map as THREE.Texture;
    const baseImg = baseMap.image as TextureImage;
    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseMap;
    // Keep the original baked atlas for the card edges and any untouched face.
    ctx.drawImage(baseImg, 0, 0, W, H);

    const drawFitted = (img: TextureImage, rect: TextureRect) => {
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      drawFittedImage(ctx, img, { x: rx, y: ry, w: rw, h: rh }, imageFit);
      ctx.restore();
    };

    drawCardFront(
      ctx,
      { x: FRONT_UV_RECT.x * W, y: FRONT_UV_RECT.y * H, w: FRONT_UV_RECT.w * W, h: FRONT_UV_RECT.h * H },
      frontImage && frontTex.image ? frontTex.image as TextureImage : null,
      imageFit
    );
    if (backImage && backTex.image) drawFitted(backTex.image as TextureImage, BACK_UV_RECT);

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, backImage, imageFit, frontTex, backTex, materials.base.map]);
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);
  const bandMaterialArgs = useMemo<[ConstructorParameters<typeof MeshLineMaterial>[0]]>(
    () => [{ resolution: new THREE.Vector2(1000, isMobile ? 2000 : 1000) }],
    [isMobile]
  );

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => {
        document.body.style.cursor = 'auto';
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== 'boolean') {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z
      });
    }
    // Rapier refs can become available on different frames, especially on a
    // cold production load. Never read a joint or mesh before it has mounted.
    if (fixed.current && j1.current && j2.current && j3.current && card.current && band.current?.geometry) {
      [j1, j2].forEach(ref => {
        const lerped = getLerped(ref.current);
        const clampedDistance = Math.max(0.1, Math.min(1, lerped.distanceTo(ref.current.translation())));
        lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(getLerped(j2.current));
      curve.points[2].copy(getLerped(j1.current));
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true);
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: ThreeEvent<PointerEvent>) => {
              (e.target as Element).releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e: ThreeEvent<PointerEvent>) => {
              (e.target as Element).setPointerCapture(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          args={bandMaterialArgs}
          color="white"
          depthTest={false}
          useMap={1}
          map={texture}
          repeat={new THREE.Vector2(-4, 1)}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}
