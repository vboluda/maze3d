import * as THREE from "three";
import type { CollisionSystem } from "./collisionSystem";
import { clamp } from "./mazeWorldMath";
import { clampEntityToBounds, createPlayerEntity } from "./mazeWorldEntities";
import type { PlayerEntity } from "./mazeWorldEntities";
import type { WorldBounds } from "./mazeWorldTypes";

export type PlayerMovementScratch = {
  forward: THREE.Vector3;
  right: THREE.Vector3;
  movement: THREE.Vector3;
};

type CreatePlayerStateParams = {
  startX: number;
  startZ: number;
  bounds: WorldBounds;
  eyeHeight: number;
  moveSpeed: number;
  turnSpeed: number;
  radius: number;
};

type UpdatePlayerParams = {
  player: PlayerEntity;
  pressed: Set<string>;
  dt: number;
  bounds: WorldBounds;
  collisionSystem: CollisionSystem;
  scratch: PlayerMovementScratch;
};

export const createPlayerState = (params: CreatePlayerStateParams): PlayerEntity =>
  createPlayerEntity(params);

export const createPlayerMovementScratch = (): PlayerMovementScratch => ({
  forward: new THREE.Vector3(),
  right: new THREE.Vector3(),
  movement: new THREE.Vector3(),
});

export const updatePlayer = ({
  player,
  pressed,
  dt,
  bounds,
  collisionSystem,
  scratch,
}: UpdatePlayerParams) => {
  if (pressed.has("q")) player.yaw += player.turnSpeed * dt;
  if (pressed.has("e")) player.yaw -= player.turnSpeed * dt;

  scratch.forward.set(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
  scratch.right.set(Math.cos(player.yaw), 0, -Math.sin(player.yaw));

  scratch.movement.set(0, 0, 0);

  if (pressed.has("w")) scratch.movement.add(scratch.forward);
  if (pressed.has("s")) scratch.movement.sub(scratch.forward);
  if (pressed.has("d")) scratch.movement.add(scratch.right);
  if (pressed.has("a")) scratch.movement.sub(scratch.right);

  if (scratch.movement.lengthSq() > 0) {
    scratch.movement.normalize().multiplyScalar(player.moveSpeed * dt);

    const nextX = clamp(player.x + scratch.movement.x, bounds.min, bounds.max);
    if (
      !collisionSystem.collidesWithWalls({
        x: nextX,
        z: player.z,
        height: player.height,
        radius: player.radius,
      })
    ) {
      player.x = nextX;
    }

    const nextZ = clamp(player.z + scratch.movement.z, bounds.min, bounds.max);
    if (
      !collisionSystem.collidesWithWalls({
        x: player.x,
        z: nextZ,
        height: player.height,
        radius: player.radius,
      })
    ) {
      player.z = nextZ;
    }
  }

  clampEntityToBounds(player, bounds);
};