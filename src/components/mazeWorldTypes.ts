import type { ReactNode } from "react";
import type * as THREE from "three";
import type { BoxProps, PlanePosition } from "./Box";
import type { EnemyProps } from "./Enemy";

export type MazeWorldLightIntensity = {
  hemisphere?: number;
  directional?: number;
};

export type WorldBounds = {
  halfWorld: number;
  min: number;
  max: number;
};

export type MazeWorldProps = {
  worldSize: number;
  startPosition: PlanePosition;
  extrernalWall?: number;
  lightIntensity?: MazeWorldLightIntensity;
  children?: ReactNode;
};

export type BoxDefinition = Required<Pick<BoxProps, "size" | "color">> & {
  position: Required<BoxProps["position"]>;
};

export type EnemyBehavior = EnemyProps["behavior"];

export type GridAxis = "x" | "y";

export type GridDirection = {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
};

export type GridPosition = {
  x: number;
  y: number;
};

export type EnemyDefinition = {
  id: EnemyProps["id"];
  behavior: EnemyBehavior;
  position: Required<EnemyProps["position"]>;
  size: number;
  height: number;
  radius: number;
  speed: number;
  patrolAxis: GridAxis;
  patrolDirection: 1 | -1;
  decisionInterval: number;
  retargetInterval: number;
};

export type WorldLayoutDefinition = {
  boxes: BoxDefinition[];
  enemies: EnemyDefinition[];
};

export type WallMeshRecord = {
  mesh: THREE.Mesh;
  size: number;
  textures: THREE.Texture[];
};

export type EnemyEntity = {
  id: string;
  kind: "enemy";
  behavior: EnemyBehavior;
  x: number;
  z: number;
  yaw: number;
  radius: number;
  height: number;
  size: number;
  speed: number;
  spawnTile: GridPosition;
  direction: GridDirection;
  nextDecisionIn: number;
  patrolAxis: GridAxis;
  patrolDirection: 1 | -1;
  decisionInterval: number;
  retargetInterval: number;
};

export type EnemyVisualRecord = {
  enemyId: string;
  mesh: THREE.Mesh;
};

export type EnemyVisualSet = {
  records: EnemyVisualRecord[];
  geometry: THREE.SphereGeometry;
  materials: Record<EnemyBehavior, THREE.MeshStandardMaterial>;
};