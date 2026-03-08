import { syncCameraToEntity, syncEnemyMeshToEntity } from "./mazeWorldEntities";
import type {
  RuntimeDisposeContext,
  RuntimeFrameContext,
  RuntimeInitContext,
} from "./gameRuntimeTypes";

const syncEnemyVisuals = (
  enemies: RuntimeInitContext["enemies"] | RuntimeFrameContext["enemies"],
  enemyVisuals: RuntimeInitContext["enemyVisuals"] | RuntimeFrameContext["enemyVisuals"]
) => {
  const enemyById = new Map(enemies.map((enemy) => [enemy.id, enemy]));

  enemyVisuals.forEach((visual) => {
    const enemy = enemyById.get(visual.enemyId);

    if (enemy) {
      syncEnemyMeshToEntity(visual.mesh, enemy);
    }
  });
};

export type SceneRuntimeSystem = {
  init: (context: RuntimeInitContext) => void;
  resize: () => void;
  renderFrame: (frame: RuntimeFrameContext) => void;
  dispose: (context: RuntimeDisposeContext) => void;
};

export const createSceneRuntimeSystem = (
  context: Pick<RuntimeInitContext, "mount" | "scene" | "camera" | "renderer">
): SceneRuntimeSystem => ({
  init: (initContext: RuntimeInitContext) => {
    syncCameraToEntity(initContext.camera, initContext.player);
    syncEnemyVisuals(initContext.enemies, initContext.enemyVisuals);
  },
  resize: () => {
    context.camera.aspect = context.mount.clientWidth / context.mount.clientHeight;
    context.camera.updateProjectionMatrix();
    context.renderer.setSize(context.mount.clientWidth, context.mount.clientHeight);
  },
  renderFrame: (frame: RuntimeFrameContext) => {
    syncCameraToEntity(context.camera, frame.player);
    syncEnemyVisuals(frame.enemies, frame.enemyVisuals);
    context.renderer.render(context.scene, context.camera);
  },
  dispose: (_context: RuntimeDisposeContext) => {
    // Reserved for future scene-runtime cleanup when rendering concerns are moved out of MazeWorld.
  },
});