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
import { buildWorldLayout } from "./mazeWorldLayout";
import type { MazeWorldProps } from "./mazeWorldTypes";
import { createPlayerState } from "./mazeWorldPlayer";
import { createEnemyEntities } from "./mazeWorldEntities";
import { startMazeWorldRuntime } from "./mazeWorldRuntime";
import { createSceneSystem } from "./sceneSystem";

export default function MazeWorld({
  worldSize,
  startPosition,
  extrernalWall = 0,
  lightIntensity,
  children,
}: MazeWorldProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const { boxes, enemies } = useMemo(
    () => buildWorldLayout(children, worldSize, extrernalWall),
    [children, extrernalWall, worldSize]
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const eyeHeight = 0.5;
    const moveSpeed = 5;
    const turnSpeed = 2.2;
    const borderPadding = 0.35;
    const playerRadius = 0.25;
    const { halfWorld, min, max } = getWorldBounds(worldSize, borderPadding);
    const startX = toTileCenterWorldX(worldSize, startPosition.x);
    const startZ = toTileCenterWorldZ(worldSize, startPosition.y);

    const enemyEntities = createEnemyEntities(enemies, worldSize, {
      halfWorld,
      min,
      max,
    });

    const sceneSystem = createSceneSystem({
      mount,
      boxes,
      enemies: enemyEntities,
      worldSize,
      halfWorld,
      lightIntensity,
    });

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
      scene: sceneSystem.scene,
      camera: sceneSystem.camera,
      renderer: sceneSystem.renderer,
      player,
      enemies: enemyEntities,
      enemyVisuals: sceneSystem.enemyVisuals.records,
      bounds: { halfWorld, min, max },
      worldSize,
      wallMeshes: sceneSystem.wallMeshes,
    });

    return () => {
      stopRuntime();
      sceneSystem.dispose();
    };
  }, [
    boxes,
    lightIntensity?.directional,
    lightIntensity?.hemisphere,
    startPosition.x,
    startPosition.y,
    enemies,
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