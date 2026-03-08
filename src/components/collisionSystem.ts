import { collidesWithPlayer, collidesWithWall } from "./mazeWorldCollisions";
import type { WallMeshRecord } from "./mazeWorldTypes";

export type CollisionSystem = {
  collidesWithWalls: (params: {
    x: number;
    z: number;
    radius: number;
    height: number;
  }) => boolean;
  collidesEntityWithPlayer: (params: {
    entityX: number;
    entityZ: number;
    entityRadius: number;
    playerX: number;
    playerZ: number;
    playerRadius: number;
  }) => boolean;
};

export const createCollisionSystem = (
  wallMeshes: WallMeshRecord[]
): CollisionSystem => ({
  collidesWithWalls: ({ x, z, radius, height }) =>
    collidesWithWall({
      x,
      z,
      radius,
      height,
      wallMeshes,
    }),
  collidesEntityWithPlayer: (params) => collidesWithPlayer(params),
});