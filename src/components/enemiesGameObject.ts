import type {
  DynamicGameObject,
  RuntimeDisposeContext,
  RuntimeFrameContext,
  RuntimeInitContext,
} from "./gameRuntimeTypes";
import { updateEnemies } from "./mazeWorldEnemies";

export type EnemiesGameObject = DynamicGameObject;

export const createEnemiesGameObject = (): EnemiesGameObject => ({
  id: "enemies",
  init: (_context: RuntimeInitContext) => {
    // Enemy visual initialization is handled by the scene runtime system.
  },
  update: (frame: RuntimeFrameContext) => {
    updateEnemies({
      enemies: frame.enemies,
      player: frame.player,
      dt: frame.dt,
      bounds: frame.bounds,
      worldSize: frame.worldSize,
      collisionSystem: frame.collisionSystem,
    });
  },
  dispose: (_context: RuntimeDisposeContext) => {
    // Reserved for future enemy-specific cleanup when visuals and logic are fully separated.
  },
});