import * as THREE from "three";
import { createGameSession } from "./gameSession";
import type {
  DynamicGameObject,
  GameSession,
  MazeWorldRuntimeConfig,
  RuntimeFrameContext,
  RuntimeInputState,
} from "./gameRuntimeTypes";

const updateRuntimeFrame = (
  frame: RuntimeFrameContext,
  input: RuntimeInputState,
  dynamicObjects: DynamicGameObject[]
) => {
  dynamicObjects.forEach((dynamicObject) => {
    dynamicObject.update(frame, input);
  });
};

export const startMazeWorldRuntime = (
  config: MazeWorldRuntimeConfig
) => {
  const session: GameSession = createGameSession(config);
  const clock = new THREE.Clock();
  let animationId = 0;

  const initContext = session.createInitContext();

  session.systems.dynamicObjects.forEach((dynamicObject) => {
    dynamicObject.init(initContext);
  });
  session.systems.sceneRuntimeSystem.init(initContext);

  const onResize = () => {
    session.systems.sceneRuntimeSystem.resize();
  };

  const animate = () => {
    animationId = requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const frame = session.createFrameContext(dt);

    updateRuntimeFrame(
      frame,
      session.systems.inputSystem.state,
      session.systems.dynamicObjects
    );

    session.systems.sceneRuntimeSystem.renderFrame(frame);
  };

  window.addEventListener("resize", onResize);

  animate();

  return () => {
    cancelAnimationFrame(animationId);
    const disposeContext = session.createDisposeContext();

    [...session.systems.dynamicObjects].reverse().forEach((dynamicObject) => {
      dynamicObject.dispose(disposeContext);
    });
    session.systems.sceneRuntimeSystem.dispose(disposeContext);

    session.systems.inputSystem.dispose();
    window.removeEventListener("resize", onResize);
  };
};