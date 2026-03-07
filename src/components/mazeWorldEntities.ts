import type * as THREE from "three";
import { clamp } from "./mazeWorldMath";
import type { WorldBounds } from "./mazeWorldTypes";

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