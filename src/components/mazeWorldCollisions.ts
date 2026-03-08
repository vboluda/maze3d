import type { WallMeshRecord } from "./mazeWorldTypes";

type CollisionParams = {
  x: number;
  z: number;
  radius: number;
  height: number;
  wallMeshes: WallMeshRecord[];
};

export const collidesWithWall = ({
  x,
  z,
  radius,
  height,
  wallMeshes,
}: CollisionParams) => {
  return wallMeshes.some(({ mesh, size }) => {
    const halfSize = size / 2;
    const wallMinX = mesh.position.x - halfSize - radius;
    const wallMaxX = mesh.position.x + halfSize + radius;
    const wallMinZ = mesh.position.z - halfSize - radius;
    const wallMaxZ = mesh.position.z + halfSize + radius;
    const wallBottomY = mesh.position.y - halfSize;
    const wallTopY = mesh.position.y + halfSize;
    const overlapsHeight = wallBottomY < height && wallTopY > 0;

    return (
      overlapsHeight &&
      x >= wallMinX &&
      x <= wallMaxX &&
      z >= wallMinZ &&
      z <= wallMaxZ
    );
  });
};

export const collidesWithPlayer = ({
  entityX,
  entityZ,
  entityRadius,
  playerX,
  playerZ,
  playerRadius,
}: {
  entityX: number;
  entityZ: number;
  entityRadius: number;
  playerX: number;
  playerZ: number;
  playerRadius: number;
}) => {
  const dx = entityX - playerX;
  const dz = entityZ - playerZ;
  const minDistance = entityRadius + playerRadius;

  return dx * dx + dz * dz <= minDistance * minDistance;
};