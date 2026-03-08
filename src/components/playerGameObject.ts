import type { PlayerEntity } from "./mazeWorldEntities";
import { syncCameraToEntity } from "./mazeWorldEntities";
import type {
  DynamicGameObject,
  RuntimeDisposeContext,
  RuntimeFrameContext,
  RuntimeInitContext,
  RuntimeInputState,
} from "./gameRuntimeTypes";
import {
  createPlayerMovementScratch,
  updatePlayer,
} from "./mazeWorldPlayer";

export type PlayerGameObject = DynamicGameObject & {
  entity: PlayerEntity;
};

export const createPlayerGameObject = (
  player: PlayerEntity
): PlayerGameObject => {
  const scratch = createPlayerMovementScratch();

  return {
    id: player.id,
    entity: player,
    init: (context: RuntimeInitContext) => {
      syncCameraToEntity(context.camera, player);
    },
    update: (frame: RuntimeFrameContext, input: RuntimeInputState) => {
      updatePlayer({
        player,
        pressed: input.pressed,
        dt: frame.dt,
        bounds: frame.bounds,
        collisionSystem: frame.collisionSystem,
        scratch,
      });
    },
    dispose: (_context: RuntimeDisposeContext) => {
      scratch.forward.set(0, 0, 0);
      scratch.right.set(0, 0, 0);
      scratch.movement.set(0, 0, 0);
    },
  };
};