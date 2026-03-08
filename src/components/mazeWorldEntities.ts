import type * as THREE from "three";
import { clamp } from "./mazeWorldMath";
import {
  toTileCenterWorldX,
  toTileCenterWorldZ,
} from "./mazeWorldMath";
import type {
  EnemyDefinition,
  EnemyEntity,
  GridDirection,
  WorldBounds,
} from "./mazeWorldTypes";

export type EntityKind = "player" | "enemy";

export type WorldEntity = {
  id: string;
  kind: EntityKind;
  x: number;
  z: number;
  yaw: number;
  radius: number;
  height: number;
};

export type PlayerEntity = WorldEntity & {
  kind: "player";
  eyeHeight: number;
  moveSpeed: number;
  turnSpeed: number;
};

type CreatePlayerEntityParams = {
  startX: number;
  startZ: number;
  bounds: WorldBounds;
  eyeHeight: number;
  moveSpeed: number;
  turnSpeed: number;
  radius: number;
};

export const createPlayerEntity = ({
  startX,
  startZ,
  bounds,
  eyeHeight,
  moveSpeed,
  turnSpeed,
  radius,
}: CreatePlayerEntityParams): PlayerEntity => ({
  id: "player",
  kind: "player",
  x: clamp(startX, bounds.min, bounds.max),
  z: clamp(startZ, bounds.min, bounds.max),
  yaw: 0,
  radius,
  height: eyeHeight,
  eyeHeight,
  moveSpeed,
  turnSpeed,
});

export const clampEntityToBounds = (
  entity: Pick<WorldEntity, "x" | "z">,
  bounds: WorldBounds
) => {
  entity.x = clamp(entity.x, bounds.min, bounds.max);
  entity.z = clamp(entity.z, bounds.min, bounds.max);
};

export const syncCameraToEntity = (
  camera: THREE.PerspectiveCamera,
  entity: Pick<PlayerEntity, "x" | "z" | "yaw" | "eyeHeight">
) => {
  camera.position.set(entity.x, entity.eyeHeight, entity.z);
  camera.rotation.order = "YXZ";
  camera.rotation.y = entity.yaw;
};

type CreateEnemyEntityParams = {
  definition: EnemyDefinition;
  worldSize: number;
  bounds: WorldBounds;
};

const getInitialEnemyDirection = (
  behavior: EnemyDefinition["behavior"],
  patrolAxis: EnemyDefinition["patrolAxis"],
  patrolDirection: EnemyDefinition["patrolDirection"]
): GridDirection => {
  if (behavior === "patrol") {
    return patrolAxis === "x"
      ? { x: patrolDirection, y: 0 }
      : { x: 0, y: patrolDirection };
  }

  return { x: 1, y: 0 };
};

export const createEnemyEntity = ({
  definition,
  worldSize,
  bounds,
}: CreateEnemyEntityParams): EnemyEntity => ({
  id: definition.id,
  kind: "enemy",
  behavior: definition.behavior,
  x: clamp(toTileCenterWorldX(worldSize, definition.position.x), bounds.min, bounds.max),
  z: clamp(toTileCenterWorldZ(worldSize, definition.position.y), bounds.min, bounds.max),
  yaw: 0,
  radius: definition.radius,
  height: definition.height,
  size: definition.size,
  speed: definition.speed,
  spawnTile: {
    x: definition.position.x,
    y: definition.position.y,
  },
  direction: getInitialEnemyDirection(
    definition.behavior,
    definition.patrolAxis,
    definition.patrolDirection
  ),
  nextDecisionIn:
    definition.behavior === "chase"
      ? definition.retargetInterval
      : definition.decisionInterval,
  patrolAxis: definition.patrolAxis,
  patrolDirection: definition.patrolDirection,
  decisionInterval: definition.decisionInterval,
  retargetInterval: definition.retargetInterval,
});

export const createEnemyEntities = (
  definitions: EnemyDefinition[],
  worldSize: number,
  bounds: WorldBounds
): EnemyEntity[] =>
  definitions.map((definition) =>
    createEnemyEntity({ definition, worldSize, bounds })
  );

export const syncEnemyMeshToEntity = (
  mesh: THREE.Mesh,
  entity: Pick<EnemyEntity, "x" | "z" | "height" | "size" | "yaw">
) => {
  const visualDiameter = Math.max(entity.size, entity.height);

  mesh.position.set(entity.x, visualDiameter / 2, entity.z);
  mesh.rotation.y = entity.yaw;
  mesh.scale.setScalar(visualDiameter);
};