import * as THREE from "three";
import { syncCameraToEntity } from "./mazeWorldEntities";
import { updateEnemies } from "./mazeWorldEnemies";
import {
  createPlayerMovementScratch,
  updatePlayer,
} from "./mazeWorldPlayer";
import type { PlayerEntity } from "./mazeWorldEntities";
import type {
  EnemyEntity,
  EnemyVisualRecord,
  WallMeshRecord,
  WorldBounds,
} from "./mazeWorldTypes";

const CONTROL_KEYS = new Set(["w", "a", "s", "d", "q", "e"]);

type MazeWorldRuntimeParams = {
  mount: HTMLDivElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  player: PlayerEntity;
  enemies: EnemyEntity[];
  enemyVisuals: EnemyVisualRecord[];
  bounds: WorldBounds;
  worldSize: number;
  wallMeshes: WallMeshRecord[];
};

export const startMazeWorldRuntime = ({
  mount,
  scene,
  camera,
  renderer,
  player,
  enemies,
  enemyVisuals,
  bounds,
  worldSize,
  wallMeshes,
}: MazeWorldRuntimeParams) => {
  syncCameraToEntity(camera, player);

  const pressed = new Set<string>();
  const clock = new THREE.Clock();
  const scratch = createPlayerMovementScratch();
  let animationId = 0;

  const onKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (CONTROL_KEYS.has(key)) {
      pressed.add(key);
      event.preventDefault();
    }
  };

  const onKeyUp = (event: KeyboardEvent) => {
    pressed.delete(event.key.toLowerCase());
  };

  const onResize = () => {
    camera.aspect = mount.clientWidth / mount.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
  };

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    const dt = clock.getDelta();

    updatePlayer({
      player,
      pressed,
      dt,
      bounds,
      wallMeshes,
      scratch,
    });

    updateEnemies({
      enemies,
      enemyVisuals,
      player,
      dt,
      bounds,
      worldSize,
      wallMeshes,
    });

    syncCameraToEntity(camera, player);
    renderer.render(scene, camera);
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("resize", onResize);

  animate();

  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("resize", onResize);
  };
};