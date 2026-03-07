import {
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  getWorldBounds,
  toTileCenterWorldX,
  toTileCenterWorldZ,
} from "./mazeWorldMath";
import type { PlayerEntity } from "./mazeWorldEntities";
import { buildWorldBoxes } from "./mazeWorldLayout";
import type { MazeWorldProps } from "./mazeWorldTypes";
import { createPlayerState } from "./mazeWorldPlayer";
import { startMazeWorldRuntime } from "./mazeWorldRuntime";
import {
  createCamera,
  createGrid,
  createGround,
  createLights,
  createRenderer,
  createScene,
  createWallMeshes,
  createWallTexture,
  disposeGrid,
  disposeWallMeshes,
} from "./mazeWorldScene";

export default function MazeWorld({
  worldSize,
  startPosition,
  extrernalWall = 0,
  lightIntensity,
  children,
}: MazeWorldProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const boxes = useMemo(
    () => buildWorldBoxes(children, worldSize, extrernalWall),
    [children, extrernalWall, worldSize]
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = createScene();
    const camera = createCamera(mount);
    const renderer = createRenderer(mount);
    const wallTexture = createWallTexture(renderer);

    const eyeHeight = 0.5;
    const moveSpeed = 5;
    const turnSpeed = 2.2;
    const borderPadding = 0.35;
    const playerRadius = 0.25;
    const { halfWorld, min, max } = getWorldBounds(worldSize, borderPadding);
    const startX = toTileCenterWorldX(worldSize, startPosition.x);
    const startZ = toTileCenterWorldZ(worldSize, startPosition.y);

    const { geometry: groundGeometry, material: groundMaterial, mesh: ground } =
      createGround(worldSize);
    scene.add(ground);

    const grid = createGrid(worldSize);
    scene.add(grid);

    const { hemiLight, dirLight } = createLights(lightIntensity);
    scene.add(hemiLight);
    scene.add(dirLight);

    const wallMeshes = createWallMeshes(
      boxes,
      worldSize,
      halfWorld,
      scene,
      wallTexture
    );

    const player: PlayerEntity = createPlayerState({
      startX,
      startZ,
      bounds: { halfWorld, min, max },
      eyeHeight,
      moveSpeed,
      turnSpeed,
      radius: playerRadius,
    });

    const stopRuntime = startMazeWorldRuntime({
      mount,
      scene,
      camera,
      renderer,
      player,
      bounds: { halfWorld, min, max },
      wallMeshes,
    });

    return () => {
      stopRuntime();

      disposeGrid(grid);

      groundGeometry.dispose();
      groundMaterial.dispose();
      disposeWallMeshes(wallMeshes);
      wallTexture.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [
    boxes,
    lightIntensity?.directional,
    lightIntensity?.hemisphere,
    startPosition.x,
    startPosition.y,
    extrernalWall,
    worldSize,
  ]);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      <div
        style={{
          position: "fixed",
          top: 16,
          left: 16,
          background: "rgba(0,0,0,0.45)",
          color: "white",
          padding: "12px 14px",
          borderRadius: 12,
          fontFamily: "sans-serif",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        <div><strong>Controls</strong></div>
        <div>W/S: move forward / backward</div>
        <div>A/D: left / right</div>
        <div>Q/E: turn left / right</div>
      </div>
    </div>
  );
}