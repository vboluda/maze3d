import { createCollisionSystem } from "./collisionSystem";
import { createDefaultDynamicGameObjects } from "./dynamicGameObjects";
import type {
  GameSession,
  MazeWorldRuntimeConfig,
  RuntimeDisposeContext,
  RuntimeFrameContext,
  RuntimeInitContext,
} from "./gameRuntimeTypes";
import { createInputSystem } from "./inputSystem";
import { createSceneRuntimeSystem } from "./sceneRuntimeSystem";

const createRuntimeInitContext = (
  config: MazeWorldRuntimeConfig,
  collisionSystem: ReturnType<typeof createCollisionSystem>
): RuntimeInitContext => ({
  ...config,
  collisionSystem,
});

const createRuntimeDisposeContext = (
  config: MazeWorldRuntimeConfig,
  collisionSystem: ReturnType<typeof createCollisionSystem>
): RuntimeDisposeContext => ({
  ...config,
  collisionSystem,
});

const createRuntimeFrameContext = (
  config: MazeWorldRuntimeConfig,
  dt: number,
  collisionSystem: ReturnType<typeof createCollisionSystem>
): RuntimeFrameContext => ({
  player: config.player,
  enemies: config.enemies,
  enemyVisuals: config.enemyVisuals,
  bounds: config.bounds,
  worldSize: config.worldSize,
  wallMeshes: config.wallMeshes,
  dt,
  collisionSystem,
});

export const createGameSession = (
  config: MazeWorldRuntimeConfig
): GameSession => {
  const inputSystem = createInputSystem();
  const collisionSystem = createCollisionSystem(config.wallMeshes);
  const dynamicObjects = createDefaultDynamicGameObjects({
    player: config.player,
  });
  const sceneRuntimeSystem = createSceneRuntimeSystem({
    mount: config.mount,
    scene: config.scene,
    camera: config.camera,
    renderer: config.renderer,
  });

  return {
    config,
    systems: {
      inputSystem,
      collisionSystem,
      sceneRuntimeSystem,
      dynamicObjects,
    },
    createInitContext: () => createRuntimeInitContext(config, collisionSystem),
    createFrameContext: (dt: number) =>
      createRuntimeFrameContext(config, dt, collisionSystem),
    createDisposeContext: () =>
      createRuntimeDisposeContext(config, collisionSystem),
  };
};