"use client";

import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";

/**
 * The animated WebGL gradient behind the welcome hero. Split into its own
 * module (rather than living inline in WelcomeHero.tsx) so it can be
 * `next/dynamic(..., { ssr: false })`'d — @shadergradient/react renders via
 * @react-three/fiber, which touches WebGL/canvas APIs that don't exist
 * during server rendering.
 *
 * Prop values are the ones requested, minus a handful (`destination`,
 * `format`, `frameRate`, `embedMode`, `gizmoHelper`, `axesHelper`) that only
 * apply to shadergradient.co's own editor/export tooling and aren't part of
 * either component's actual prop type — passing them through would fail
 * typecheck without changing anything visually.
 */
export function ShaderGradientBackground() {
  return (
    <ShaderGradientCanvas
      style={{ width: "100%", height: "100%" }}
      pixelDensity={1}
      fov={45}
      pointerEvents="none"
    >
      <ShaderGradient
        animate="on"
        type="plane"
        wireframe={false}
        shader="defaults"
        uTime={0}
        uSpeed={0.3}
        uStrength={4}
        uDensity={1.3}
        uFrequency={5.5}
        uAmplitude={1}
        positionX={-1.4}
        positionY={0}
        positionZ={0}
        rotationX={0}
        rotationY={10}
        rotationZ={50}
        color1="#3d84ff"
        color2="#b9b6db"
        color3="#d0bce1"
        reflection={0.1}
        cAzimuthAngle={180}
        cPolarAngle={90}
        cDistance={3.6}
        cameraZoom={1}
        lightType="3d"
        brightness={1.2}
        envPreset="city"
        grain="off"
        range="disabled"
        rangeStart={0}
        rangeEnd={40}
      />
    </ShaderGradientCanvas>
  );
}
