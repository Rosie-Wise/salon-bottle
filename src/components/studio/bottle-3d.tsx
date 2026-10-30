'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  buildLabelTexture,
  type LabelTextureOptions,
} from '@/lib/bottle/build-label-texture';
import { BOTTLE_PHYSICAL } from '@/lib/bottle/physical';
import { BOTTLE_SURFACE, CAP_SURFACE } from '@/lib/sticker/bottle-surface';
import { cn } from '@/lib/utils';

export interface Bottle3DProps {
  productType: LabelTextureOptions['productType'];
  logoUrl: string | null;
  logoScale: number;
  logoOffsetX: number;
  logoOffsetY: number;
  salonName?: string;
  resetToken?: number;
  className?: string;
}

function useLabelMap(opts: LabelTextureOptions) {
  const [map, setMap] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const canvas = await buildLabelTexture(opts);
        if (cancelled) return;
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.needsUpdate = true;
        setMap((prev) => {
          prev?.dispose();
          return tex;
        });
      } catch {
        // keep previous
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    opts.productType,
    opts.logoUrl,
    opts.logoScale,
    opts.logoOffsetX,
    opts.logoOffsetY,
    opts.salonName,
  ]);

  useEffect(
    () => () => {
      map?.dispose();
    },
    [map],
  );

  return map;
}

function ProceduralBottle({ map }: { map: THREE.CanvasTexture | null }) {
  const { scene } = BOTTLE_PHYSICAL;

  const bodyMat = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: BOTTLE_SURFACE,
      roughness: 0.4,
      metalness: 0.02,
      clearcoat: 0.2,
      clearcoatRoughness: 0.42,
      map: null,
    });
  }, []);

  useEffect(() => {
    bodyMat.map = map;
    bodyMat.needsUpdate = true;
  }, [map, bodyMat]);

  const capMat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: CAP_SURFACE,
        roughness: 0.32,
        metalness: 0.04,
        clearcoat: 0.35,
        clearcoatRoughness: 0.38,
      }),
    [],
  );

  const labelH = scene.bodyHeight * scene.labelHeightRatio;

  // Rotate so the front label panel faces the camera at rest
  return (
    <group position={[0, -0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow receiveShadow material={bodyMat}>
        <cylinderGeometry
          args={[scene.bodyRadius, scene.bodyRadius, labelH, 96, 1, false]}
        />
      </mesh>

      <mesh
        castShadow
        position={[0, labelH / 2 + scene.shoulderHeight * 0.35, 0]}
        material={capMat}
      >
        <cylinderGeometry
          args={[
            scene.capRadius * 0.92,
            scene.bodyRadius,
            scene.shoulderHeight,
            64,
          ]}
        />
      </mesh>

      <mesh
        castShadow
        position={[
          0,
          labelH / 2 + scene.shoulderHeight + scene.neckHeight / 2,
          0,
        ]}
        material={capMat}
      >
        <cylinderGeometry
          args={[
            scene.capRadius * 0.7,
            scene.capRadius * 0.78,
            scene.neckHeight,
            48,
          ]}
        />
      </mesh>

      <mesh
        castShadow
        position={[
          0,
          labelH / 2 +
            scene.shoulderHeight +
            scene.neckHeight +
            scene.capHeight / 2,
          0,
        ]}
        material={capMat}
      >
        <cylinderGeometry
          args={[scene.capRadius, scene.capRadius, scene.capHeight, 64]}
        />
      </mesh>

      <mesh
        castShadow
        position={[
          0,
          labelH / 2 +
            scene.shoulderHeight +
            scene.neckHeight +
            scene.capHeight +
            0.02,
          0,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={capMat}
      >
        <circleGeometry args={[scene.capRadius, 64]} />
      </mesh>

      <mesh
        position={[
          0,
          labelH / 2 +
            scene.shoulderHeight +
            scene.neckHeight +
            scene.capHeight * 0.55,
          scene.capRadius * 0.92,
        ]}
        material={capMat}
      >
        <boxGeometry args={[0.28, 0.06, 0.04]} />
      </mesh>
    </group>
  );
}

function Controls({ resetToken }: { resetToken: number }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = useRef<any>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.setAzimuthalAngle?.(0);
    c.setPolarAngle?.(Math.PI / 2);
    c.update?.();
  }, [resetToken]);

  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enablePan={false}
      enableZoom={false}
      minPolarAngle={Math.PI / 2 - 0.1}
      maxPolarAngle={Math.PI / 2 + 0.1}
      enableDamping
      dampingFactor={0.075}
      rotateSpeed={0.9}
    />
  );
}

function Scene({
  opts,
  resetToken,
}: {
  opts: LabelTextureOptions;
  resetToken: number;
}) {
  const map = useLabelMap(opts);
  const { gl } = useThree();

  useEffect(() => {
    gl.setClearColor(0x000000, 0);
  }, [gl]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 7, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} />
      <hemisphereLight args={['#ffffff', '#e8e2d8', 0.45]} />
      <ProceduralBottle map={map} />
      <ContactShadows
        position={[0, -1.9, 0]}
        opacity={0.25}
        scale={9}
        blur={2.6}
        far={4.5}
      />
      <Controls resetToken={resetToken} />
    </>
  );
}

/**
 * Interactive 200 mL bottle with continuous wraparound label.
 * Procedural cylinder model — replace with production GLB when available
 * (see BOTTLE_PHYSICAL.scene for placement proportions).
 */
export function Bottle3D({
  productType,
  logoUrl,
  logoScale,
  logoOffsetX,
  logoOffsetY,
  salonName,
  resetToken = 0,
  className,
}: Bottle3DProps) {
  const [webglOk, setWebglOk] = useState(true);
  const opts = useMemo(
    () => ({
      productType,
      logoUrl,
      logoScale,
      logoOffsetX,
      logoOffsetY,
      salonName,
    }),
    [productType, logoUrl, logoScale, logoOffsetX, logoOffsetY, salonName],
  );

  useEffect(() => {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) setWebglOk(false);
    } catch {
      setWebglOk(false);
    }
  }, []);

  if (!webglOk) {
    return (
      <div
        className={cn(
          'flex aspect-[3/5] w-full items-center justify-center px-6 text-center text-sm text-muted',
          className,
        )}
      >
        3D preview needs WebGL. Try another browser, or use Download Preview for
        a flat label export.
      </div>
    );
  }

  return (
    <div className={cn('relative h-full min-h-[400px] w-full', className)}>
      <Canvas
        camera={{ position: [0, 0.15, 6.4], fov: 30 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene opts={opts} resetToken={resetToken} />
        </Suspense>
      </Canvas>
    </div>
  );
}
