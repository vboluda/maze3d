import type * as THREE from "three";
import type {
  BoxDefinition,
  EnemyEntity,
  MazeWorldLightIntensity,
  WallMeshRecord,
} from "./mazeWorldTypes";
import {
  createCamera,
  createEnemyVisuals,
  createGrid,
  createGround,
  createLights,
  createRenderer,
  createScene,
  createWallMeshes,
  createWallTexture,
  disposeEnemyVisuals,
  disposeGrid,
  disposeWallMeshes,
} from "./mazeWorldScene";

export type SceneSystem = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  wallMeshes: WallMeshRecord[];
  enemyVisuals: ReturnType<typeof createEnemyVisuals>;
  dispose: () => void;
};

type CreateSceneSystemParams = {
  mount: HTMLDivElement;
  boxes: BoxDefinition[];
  enemies: EnemyEntity[];
  worldSize: number;
  halfWorld: number;
  lightIntensity?: MazeWorldLightIntensity;
};

export const createSceneSystem = ({
  mount,
  boxes,
  enemies,
  worldSize,
  halfWorld,
  lightIntensity,
}: CreateSceneSystemParams): SceneSystem => {
  const scene = createScene();
  const camera = createCamera(mount);
  const renderer = createRenderer(mount);
  const wallTexture = createWallTexture(renderer);

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

  const enemyVisuals = createEnemyVisuals(enemies, scene);

  return {
    scene,
    camera,
    renderer,
    wallMeshes,
    enemyVisuals,
    dispose: () => {
      disposeGrid(grid);
      groundGeometry.dispose();
      groundMaterial.dispose();
      disposeEnemyVisuals(enemyVisuals, scene);
      disposeWallMeshes(wallMeshes);
      wallTexture.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    },
  };
};