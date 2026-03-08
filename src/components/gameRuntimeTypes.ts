import type * as THREE from "three";
import type { CollisionSystem } from "./collisionSystem";
import type { InputSystem } from "./inputSystem";
import type { PlayerEntity } from "./mazeWorldEntities";
import type { SceneRuntimeSystem } from "./sceneRuntimeSystem";
import type {
  EnemyEntity,
  EnemyVisualRecord,
  WallMeshRecord,
  WorldBounds,
} from "./mazeWorldTypes";

export type RuntimeRenderContext = {
  mount: HTMLDivElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
};

export type RuntimeSimulationContext = {
  player: PlayerEntity;
  enemies: EnemyEntity[];
  enemyVisuals: EnemyVisualRecord[];
  bounds: WorldBounds;
  worldSize: number;
  wallMeshes: WallMeshRecord[];
};

export type MazeWorldRuntimeConfig = RuntimeRenderContext &
  RuntimeSimulationContext;

export type RuntimeInitContext = MazeWorldRuntimeConfig & {
  collisionSystem: CollisionSystem;
};

export type RuntimeDisposeContext = MazeWorldRuntimeConfig & {
  collisionSystem: CollisionSystem;
};

export type RuntimeFrameContext = RuntimeSimulationContext & {
  dt: number;
  collisionSystem: CollisionSystem;
};

export type RuntimeInputState = {
  pressed: Set<string>;
};

export type DynamicGameObject = {
  id: string;
  init: (context: RuntimeInitContext) => void;
  update: (frame: RuntimeFrameContext, input: RuntimeInputState) => void;
  dispose: (context: RuntimeDisposeContext) => void;
};

export type GameSystems = {
  inputSystem: InputSystem;
  collisionSystem: CollisionSystem;
  sceneRuntimeSystem: SceneRuntimeSystem;
  dynamicObjects: DynamicGameObject[];
};

export type GameSession = {
  config: MazeWorldRuntimeConfig;
  systems: GameSystems;
  createInitContext: () => RuntimeInitContext;
  createFrameContext: (dt: number) => RuntimeFrameContext;
  createDisposeContext: () => RuntimeDisposeContext;
};