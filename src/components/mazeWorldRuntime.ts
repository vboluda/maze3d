import * as THREE from "three";
import { createCollisionSystem } from "./collisionSystem";
import { createDefaultDynamicGameObjects } from "./dynamicGameObjects";
import type {
  DynamicGameObject,
  RuntimeDisposeContext,
  RuntimeInitContext,
  MazeWorldRuntimeConfig,
  RuntimeFrameContext,
  RuntimeInputState,
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

const updateRuntimeFrame = (
  frame: RuntimeFrameContext,
  input: RuntimeInputState,
  dynamicObjects: DynamicGameObject[]
) => {
  dynamicObjects.forEach((dynamicObject) => {
    dynamicObject.update(frame, input);
  });
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
}: MazeWorldRuntimeConfig) => {
  const inputSystem = createInputSystem();
  const collisionSystem = createCollisionSystem(wallMeshes);
  const dynamicObjects = createDefaultDynamicGameObjects({ player });
  const sceneRuntimeSystem = createSceneRuntimeSystem({
    mount,
    scene,
    camera,
    renderer,
  });
  const clock = new THREE.Clock();
  let animationId = 0;

  const initContext = createRuntimeInitContext(
    {
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
    },
    collisionSystem
  );

  dynamicObjects.forEach((dynamicObject) => {
    dynamicObject.init(initContext);
  });
  sceneRuntimeSystem.init(initContext);

  const onResize = () => {
    sceneRuntimeSystem.resize();
  };

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const frame = createRuntimeFrameContext(
      {
        player,
        enemies,
        enemyVisuals,
        bounds,
        worldSize,
        wallMeshes,
        mount,
        scene,
        camera,
        renderer,
      },
      dt,
      collisionSystem
    );

    updateRuntimeFrame(
      frame,
      inputSystem.state,
      dynamicObjects
    );

    sceneRuntimeSystem.renderFrame(frame);
  };

  window.addEventListener("resize", onResize);

  animate();

  return () => {
    cancelAnimationFrame(animationId);
    const disposeContext = createRuntimeDisposeContext(
      {
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
      },
      collisionSystem
    );

    [...dynamicObjects].reverse().forEach((dynamicObject) => {
      dynamicObject.dispose(disposeContext);
    });
    sceneRuntimeSystem.dispose(disposeContext);

    inputSystem.dispose();
    window.removeEventListener("resize", onResize);
  };
};